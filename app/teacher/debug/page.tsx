"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase/userManagement";

export default function DebugPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDebugInfo() {
      try {
        const supabase = createClient();
        
        // Get auth user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log("Auth user:", user);
        console.log("Auth error:", authError);
        setAuthUser(user);

        if (authError) {
          setError(`Auth error: ${authError.message}`);
        }

        // Get profile
        const userProfile = await getCurrentUserProfile();
        console.log("User profile:", userProfile);
        setProfile(userProfile);

        if (!userProfile) {
          setError("Profile is null");
        }
      } catch (err) {
        console.error("Debug error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadDebugInfo();
  }, []);

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Auth User</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authUser, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">User Profile</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Analysis</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Auth user exists: {authUser ? "✅ Yes" : "❌ No"}</li>
            <li>Auth user ID: {authUser?.id || "N/A"}</li>
            <li>Auth user email: {authUser?.email || "N/A"}</li>
            <li>Profile exists: {profile ? "✅ Yes" : "❌ No"}</li>
            <li>Profile role: {profile?.role || "N/A"}</li>
            <li>Is super_admin: {profile?.role === "super_admin" ? "✅ Yes" : "❌ No"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
