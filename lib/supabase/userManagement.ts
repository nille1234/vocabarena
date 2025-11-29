import { createClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'teacher';
  passwordChangeRequired: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) return null;

    return {
      id: profile.id,
      email: user.email || '',
      role: profile.role,
      passwordChangeRequired: profile.password_change_required,
      createdBy: profile.created_by,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
      lastSignInAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    // First check if current user is super admin
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile || currentProfile.role !== 'super_admin') {
      console.log('User is not super admin, returning empty array');
      return [];
    }

    // Get session token for API authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session found');
      return [];
    }

    // Call API route to get all users with emails
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching users from API:', error);
      return [];
    }

    const { users } = await response.json();

    return users.map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      passwordChangeRequired: user.passwordChangeRequired,
      createdBy: user.createdBy,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function updatePasswordChangeRequired(
  userId: string,
  required: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ password_change_required: required })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating password change required:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Get session token for API authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'No session found' };
    }

    // Call API route to delete user
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to delete user' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
