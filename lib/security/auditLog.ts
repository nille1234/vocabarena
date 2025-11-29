import { createServiceRoleClient } from '@/lib/supabase/server';

export type AuditAction = 
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'session_expired'
  | 'session_invalidated'
  | 'password_changed'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'game_link_created'
  | 'game_link_updated'
  | 'game_link_deleted'
  | 'vocabulary_list_created'
  | 'vocabulary_list_updated'
  | 'vocabulary_list_deleted'
  | 'unauthorized_access_attempt';

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log a security or audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.userId || null,
        action: entry.action,
        details: entry.details || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
      });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Get request metadata for audit logging
 */
export function getRequestMetadata(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const ipAddress = 
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}
