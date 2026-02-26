import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DebugAccessPage() {
  const supabase = await createClient();
  
  // Get user and session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // Get user profile if user exists
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Teacher Page Access Diagnostic</CardTitle>
          <CardDescription>
            This page shows why you can or cannot access /teacher
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Authentication Status</h3>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              {user ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">User Authentication</p>
                <p className="text-sm text-muted-foreground">
                  {user ? `Logged in as: ${user.email}` : 'Not logged in'}
                </p>
                {userError && (
                  <p className="text-sm text-red-500 mt-1">Error: {userError.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              {session ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">Active Session</p>
                <p className="text-sm text-muted-foreground">
                  {session ? 'Valid session found' : 'No active session'}
                </p>
                {sessionError && (
                  <p className="text-sm text-red-500 mt-1">Error: {sessionError.message}</p>
                )}
              </div>
            </div>

            {user && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                {profile ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">User Profile</p>
                  {profile ? (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Role: {profile.role || 'No role assigned'}</p>
                      <p>Email confirmed: {profile.email_confirmed ? 'Yes' : 'No'}</p>
                      <p>Password change required: {profile.password_change_required ? 'Yes' : 'No'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Profile not found in database</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Access Summary */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Access Summary</h3>
            {user && session ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-700 dark:text-green-400">
                      You should be able to access /teacher
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All authentication requirements are met.
                    </p>
                  </div>
                </div>
                <Link href="/teacher">
                  <Button className="w-full" size="lg">
                    Go to Teacher Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-700 dark:text-red-400">
                      Cannot access /teacher
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You need to log in first to access the teacher dashboard.
                    </p>
                  </div>
                </div>
                <Link href="/auth/login?redirectTo=/teacher">
                  <Button className="w-full" size="lg">
                    Go to Login Page
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• If you don't have an account, contact a super admin to invite you</p>
              <p>• If you forgot your password, use the "Forgot Password" link on the login page</p>
              <p>• If you're having other issues, check the browser console for errors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
