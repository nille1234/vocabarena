import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the current user is a super admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: currentUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if current user is super admin
    const { data: currentProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (profileError || !currentProfile || currentProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can view all users' },
        { status: 403 }
      );
    }

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    // Get auth user data for each profile
    const usersWithEmails = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          
          if (authError || !authUser.user) {
            console.error(`Error fetching auth user ${profile.id}:`, authError);
            return {
              id: profile.id,
              email: 'Error loading',
              role: profile.role,
              passwordChangeRequired: profile.password_change_required,
              createdBy: profile.created_by,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
              lastSignInAt: null,
            };
          }

          return {
            id: profile.id,
            email: authUser.user.email || 'No email',
            role: profile.role,
            passwordChangeRequired: profile.password_change_required,
            createdBy: profile.created_by,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
            lastSignInAt: authUser.user.last_sign_in_at,
          };
        } catch (error) {
          console.error(`Error processing user ${profile.id}:`, error);
          return {
            id: profile.id,
            email: 'Error loading',
            role: profile.role,
            passwordChangeRequired: profile.password_change_required,
            createdBy: profile.created_by,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
            lastSignInAt: null,
          };
        }
      })
    );

    return NextResponse.json({ users: usersWithEmails });
  } catch (error) {
    console.error('Error in users route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
