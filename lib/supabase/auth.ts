import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'teacher';

export interface UserWithProfile extends User {
  role?: UserRole;
  passwordChangeRequired?: boolean;
}

/**
 * Server-side authentication guard
 * Validates user session and redirects to login if invalid
 * @param redirectTo - Optional path to redirect to after login
 * @returns User object if authenticated
 */
export async function requireAuth(redirectTo?: string): Promise<UserWithProfile> {
  const supabase = await createClient();
  
  // Get user from session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Get session to validate it's active
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // If no user, error getting user, no session, or error getting session - redirect to login
  if (!user || userError || !session || sessionError) {
    console.warn('Authentication required - redirecting to login', {
      hasUser: !!user,
      userError: userError?.message,
      hasSession: !!session,
      sessionError: sessionError?.message
    });
    
    const loginUrl = redirectTo 
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login';
    
    redirect(loginUrl);
  }
  
  // Validate session hasn't expired
  if (session.expires_at) {
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    
    if (expiresAt <= now) {
      console.warn('Session expired - redirecting to login');
      redirect(redirectTo 
        ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/auth/login'
      );
    }
  }

  // Get user profile for role information
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, password_change_required')
    .eq('id', user.id)
    .single();

  const userWithProfile: UserWithProfile = {
    ...user,
    role: profile?.role as UserRole,
    passwordChangeRequired: profile?.password_change_required,
  };
  
  return userWithProfile;
}

/**
 * Require specific role for access
 * @param allowedRoles - Array of allowed roles
 * @param redirectTo - Optional path to redirect to after login
 * @returns User object with profile if authorized
 */
export async function requireRole(
  allowedRoles: UserRole[],
  redirectTo?: string
): Promise<UserWithProfile> {
  const user = await requireAuth(redirectTo);

  if (!user.role || !allowedRoles.includes(user.role)) {
    console.warn('Unauthorized role access attempt', {
      userId: user.id,
      userRole: user.role,
      allowedRoles,
    });
    redirect('/auth/login?error=unauthorized');
  }

  return user;
}

/**
 * Check if user is authenticated without redirecting
 * @returns User object with profile if authenticated, null otherwise
 */
export async function getAuthUser(): Promise<UserWithProfile | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (!user || userError || !session || sessionError) {
    return null;
  }
  
  // Check if session is expired
  if (session.expires_at) {
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    
    if (expiresAt <= now) {
      return null;
    }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, password_change_required')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    role: profile?.role as UserRole,
    passwordChangeRequired: profile?.password_change_required,
  };
}
