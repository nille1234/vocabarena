"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugProfilePage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDebugInfo() {
      const supabase = createClient();
      
      try {
        // Get user from auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Get profile from database
        let profile = null;
        let profileError = null;
        
        if (user) {
          const result = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          profile = result.data;
          profileError = result.error;
        }
        
        setDebugInfo({
          user: user ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
          } : null,
          userError: userError?.message,
          profile,
          profileError: profileError?.message,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        setDebugInfo({
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadDebugInfo();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="bg-slate-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
