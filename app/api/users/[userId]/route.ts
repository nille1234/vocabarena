import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    // Verify the current user using a client with their JWT token
    const token = authHeader.replace('Bearer ', '');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
    
    if (!anonKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing anon key' },
        { status: 500 }
      );
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: { user: currentUser }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !currentUser) {
      console.error('Error verifying user:', userError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if current user is super admin
    const { data: currentProfile, error: currentProfileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentProfileError || !currentProfile || currentProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can delete users' },
        { status: 403 }
      );
    }

    // Prevent users from deleting themselves
    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if the user profile exists in the database
    const { data: profileToDelete, error: profileToDeleteError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (profileToDeleteError || !profileToDelete) {
      console.error('User profile not found:', profileToDeleteError);
      return NextResponse.json(
        { error: 'User not found. They may have already been deleted.' },
        { status: 404 }
      );
    }

    // Prevent deletion of super admin accounts (extra safety check)
    if (profileToDelete.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin accounts' },
        { status: 403 }
      );
    }

    // Try to delete from Supabase Auth (may not exist if orphaned)
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authUser) {
      // User exists in auth, delete them
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        return NextResponse.json(
          { error: deleteAuthError.message || 'Failed to delete user from authentication' },
          { status: 400 }
        );
      }
    } else {
      console.log('Auth user not found, will clean up profile record only');
    }

    // Delete the user profile (this will cascade delete vocabulary lists and game links)
    // This handles both normal deletions and cleanup of orphaned profiles
    const { error: deleteProfileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('Error deleting user profile:', deleteProfileError);
      return NextResponse.json(
        { error: 'Failed to delete user profile' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete user route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
