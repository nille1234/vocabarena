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
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': `supabase-js-node/${Date.now()}`,
        },
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

    // Get all user profiles - force fresh data by adding a timestamp filter that's always true
    // This prevents any potential caching at the Supabase client level
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .gte('created_at', '1970-01-01') // Always true, but forces fresh query
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    // Get content counts for all users in parallel
    const [vocabularyListsData, gameLinksData, classesData] = await Promise.all([
      supabaseAdmin
        .from('vocabulary_lists')
        .select('user_id', { count: 'exact', head: false }),
      supabaseAdmin
        .from('game_links')
        .select('user_id', { count: 'exact', head: false }),
      supabaseAdmin
        .from('classes')
        .select('teacher_id', { count: 'exact', head: false }),
    ]);

    // Create count maps for quick lookup
    const vocabularyListCounts = new Map<string, number>();
    const gameLinkCounts = new Map<string, number>();
    const classCounts = new Map<string, number>();

    vocabularyListsData.data?.forEach((item) => {
      const userId = item.user_id;
      vocabularyListCounts.set(userId, (vocabularyListCounts.get(userId) || 0) + 1);
    });

    gameLinksData.data?.forEach((item) => {
      const userId = item.user_id;
      gameLinkCounts.set(userId, (gameLinkCounts.get(userId) || 0) + 1);
    });

    classesData.data?.forEach((item) => {
      const userId = item.teacher_id;
      classCounts.set(userId, (classCounts.get(userId) || 0) + 1);
    });

    // Get auth user data for each profile and filter out deleted users
    const usersWithEmails = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          
          if (authError || !authUser.user) {
            console.log(`User ${profile.id} not found in auth, skipping (likely deleted)`);
            return null; // Return null for deleted users
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
            vocabularyListCount: vocabularyListCounts.get(profile.id) || 0,
            gameLinkCount: gameLinkCounts.get(profile.id) || 0,
            classCount: classCounts.get(profile.id) || 0,
          };
        } catch (error) {
          console.error(`Error processing user ${profile.id}:`, error);
          return null; // Return null for users with errors
        }
      })
    );

    // Filter out null values (deleted users)
    const validUsers = usersWithEmails.filter(user => user !== null);

    return NextResponse.json(
      { users: validUsers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error in users route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
