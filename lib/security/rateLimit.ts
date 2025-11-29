import { createClient } from '@/lib/supabase/server';

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetAt: Date;
  requiresCaptcha: boolean;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 5;
const CAPTCHA_THRESHOLD = 3;

/**
 * Check if a login attempt is allowed based on rate limiting
 */
export async function checkLoginRateLimit(
  email: string,
  ipAddress: string
): Promise<RateLimitResult> {
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  // Get recent failed attempts for this IP and email
  const { data: ipAttempts } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('success', false)
    .gte('attempted_at', windowStart.toISOString())
    .order('attempted_at', { ascending: false });

  const { data: emailAttempts } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('email', email)
    .eq('success', false)
    .gte('attempted_at', windowStart.toISOString())
    .order('attempted_at', { ascending: false });

  const ipFailedCount = ipAttempts?.length || 0;
  const emailFailedCount = emailAttempts?.length || 0;
  const totalFailedCount = Math.max(ipFailedCount, emailFailedCount);

  const allowed = totalFailedCount < MAX_ATTEMPTS;
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - totalFailedCount);
  const requiresCaptcha = totalFailedCount >= CAPTCHA_THRESHOLD;

  // Calculate reset time (5 minutes from the oldest attempt in the window)
  const oldestAttempt = ipAttempts?.[ipAttempts.length - 1]?.attempted_at || 
                        emailAttempts?.[emailAttempts.length - 1]?.attempted_at;
  const resetAt = oldestAttempt 
    ? new Date(new Date(oldestAttempt).getTime() + WINDOW_MINUTES * 60 * 1000)
    : new Date(Date.now() + WINDOW_MINUTES * 60 * 1000);

  return {
    allowed,
    remainingAttempts,
    resetAt,
    requiresCaptcha,
  };
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('login_attempts').insert({
    email,
    ip_address: ipAddress,
    success,
  });

  // Clean up old attempts (older than 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await supabase
    .from('login_attempts')
    .delete()
    .lt('attempted_at', sevenDaysAgo.toISOString());
}

/**
 * Get exponential backoff delay in seconds based on failed attempts
 */
export function getBackoffDelay(failedAttempts: number): number {
  if (failedAttempts <= 0) return 0;
  
  const delays = [0, 60, 120, 300, 900, 1800]; // 0s, 1m, 2m, 5m, 15m, 30m
  return delays[Math.min(failedAttempts, delays.length - 1)];
}
