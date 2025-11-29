import { createServiceRoleClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export interface SessionData {
  id: string;
  userId: string;
  tabSessionId: string;
  expiresAt: Date;
  lastActivityAt: Date;
}

const ABSOLUTE_TIMEOUT_MINUTES = 30;
const IDLE_TIMEOUT_MINUTES = 10;

/**
 * Generate a unique tab session ID
 */
export function generateTabSessionId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  tabSessionId: string,
  ipAddress: string,
  userAgent: string
): Promise<SessionData> {
  const supabase = createServiceRoleClient();
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ABSOLUTE_TIMEOUT_MINUTES * 60 * 1000);

  // Invalidate all other sessions for this user (single active session)
  await supabase
    .from('auth_sessions')
    .update({ invalidated_at: now.toISOString() })
    .eq('user_id', userId)
    .is('invalidated_at', null);

  // Create new session
  const { data, error } = await supabase
    .from('auth_sessions')
    .insert({
      user_id: userId,
      tab_session_id: tabSessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString(),
      last_activity_at: now.toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create session');
  }

  return {
    id: data.id,
    userId: data.user_id,
    tabSessionId: data.tab_session_id,
    expiresAt: new Date(data.expires_at),
    lastActivityAt: new Date(data.last_activity_at),
  };
}

/**
 * Validate and get session
 */
export async function validateSession(
  tabSessionId: string
): Promise<SessionData | null> {
  const supabase = createServiceRoleClient();
  const now = new Date();

  const { data, error } = await supabase
    .from('auth_sessions')
    .select('*')
    .eq('tab_session_id', tabSessionId)
    .is('invalidated_at', null)
    .single();

  if (error || !data) {
    return null;
  }

  const expiresAt = new Date(data.expires_at);
  const lastActivityAt = new Date(data.last_activity_at);

  // Check absolute timeout
  if (now > expiresAt) {
    await invalidateSession(tabSessionId);
    return null;
  }

  // Check idle timeout
  const idleTimeoutMs = IDLE_TIMEOUT_MINUTES * 60 * 1000;
  if (now.getTime() - lastActivityAt.getTime() > idleTimeoutMs) {
    await invalidateSession(tabSessionId);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    tabSessionId: data.tab_session_id,
    expiresAt,
    lastActivityAt,
  };
}

/**
 * Update session activity
 */
export async function updateSessionActivity(tabSessionId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const now = new Date();

  await supabase
    .from('auth_sessions')
    .update({ last_activity_at: now.toISOString() })
    .eq('tab_session_id', tabSessionId)
    .is('invalidated_at', null);
}

/**
 * Invalidate a session
 */
export async function invalidateSession(tabSessionId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const now = new Date();

  await supabase
    .from('auth_sessions')
    .update({ invalidated_at: now.toISOString() })
    .eq('tab_session_id', tabSessionId);
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const now = new Date();

  await supabase
    .from('auth_sessions')
    .update({ invalidated_at: now.toISOString() })
    .eq('user_id', userId)
    .is('invalidated_at', null);
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const supabase = createServiceRoleClient();
  const now = new Date();

  await supabase
    .from('auth_sessions')
    .delete()
    .or(`expires_at.lt.${now.toISOString()},invalidated_at.not.is.null`);
}
