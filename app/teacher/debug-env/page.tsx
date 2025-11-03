export default function DebugEnvPage() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      <div className="space-y-2">
        <p>NEXT_PUBLIC_SUPABASE_URL: {hasUrl ? '✅ Set' : '❌ Missing'}</p>
        <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: {hasAnonKey ? '✅ Set' : '❌ Missing'}</p>
        {hasUrl && (
          <p className="text-sm text-gray-600">
            URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
        )}
      </div>
    </div>
  );
}
