"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TestDatabasePage() {
  const [results, setResults] = useState<any>({
    supabaseConfigured: null,
    tablesExist: null,
    canQuery: null,
    error: null,
  });
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const newResults: any = {
      supabaseConfigured: false,
      tablesExist: false,
      canQuery: false,
      error: null,
    };

    try {
      // Debug: Log environment variables
      console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
      console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? 'Set' : 'Not set');

      // Test 1: Check if Supabase is configured
      const supabase = createClient();
      if (supabase) {
        newResults.supabaseConfigured = true;
      } else {
        newResults.error = "Supabase client not initialized - check environment variables";
        setResults(newResults);
        setTesting(false);
        return;
      }

      // Test 2: Check if tables exist
      try {
        const { data, error } = await supabase
          .from('vocabulary_lists')
          .select('id')
          .limit(1);

        if (error) {
          newResults.tablesExist = false;
          newResults.error = `Tables don't exist: ${error.message}`;
        } else {
          newResults.tablesExist = true;
          newResults.canQuery = true;
        }
      } catch (err: any) {
        newResults.tablesExist = false;
        newResults.error = err.message;
      }

    } catch (err: any) {
      newResults.error = err.message;
    }

    setResults(newResults);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    if (status) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Supabase Configured</span>
              <StatusIcon status={results.supabaseConfigured} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Tables Exist</span>
              <StatusIcon status={results.tablesExist} />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Can Query Database</span>
              <StatusIcon status={results.canQuery} />
            </div>

            {results.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Error:</strong> {results.error}
                </AlertDescription>
              </Alert>
            )}

            {results.tablesExist === false && (
              <Alert>
                <AlertDescription>
                  <strong>Action Required:</strong> You need to run the database migration.
                  <br /><br />
                  <strong>Steps:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Go to your Supabase Dashboard</li>
                    <li>Open SQL Editor</li>
                    <li>Copy contents from: <code className="bg-muted px-1 py-0.5 rounded">supabase/migrations/002_vocabulary_management.sql</code></li>
                    <li>Paste and run the SQL</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {results.canQuery === true && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <AlertDescription className="text-green-700 dark:text-green-400">
                  ✅ Everything is working! You can now create game links.
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={runTests} disabled={testing} className="w-full">
              {testing ? "Testing..." : "Run Tests Again"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-mono">
            <div>
              <strong>Supabase URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set"}
            </div>
            <div>
              <strong>Supabase Key:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? "✅ Set" : "❌ Not set"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
