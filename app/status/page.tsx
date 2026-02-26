export const dynamic = 'force-dynamic';

export default function StatusPage() {
  const now = new Date().toISOString();
  
  return (
    <html>
      <head>
        <title>Server Status</title>
      </head>
      <body style={{ 
        fontFamily: 'system-ui, sans-serif', 
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#22c55e', fontSize: '2rem', marginBottom: '1rem' }}>
          ✓ Next.js Server is Running
        </h1>
        
        <div style={{ 
          background: '#f0f9ff', 
          border: '2px solid #0ea5e9',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0 }}>Server Information</h2>
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>Status:</strong> Online ✓</li>
            <li><strong>Current Time:</strong> {now}</li>
            <li><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</li>
            <li><strong>Next.js:</strong> Running</li>
          </ul>
        </div>

        <div style={{ 
          background: '#fef3c7', 
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0 }}>⚠️ Important Information</h2>
          <p>
            If you're seeing "ERR_CONNECTION_REFUSED" when trying to access <code>localhost:3000</code> 
            in your own browser, this is expected behavior in the Henosia environment.
          </p>
          <p>
            <strong>The application is running correctly</strong> - you should use the Henosia preview 
            browser (the panel on the right side of the Henosia interface) to view your application, 
            not your local browser.
          </p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Quick Links</h2>
          <ul style={{ lineHeight: '2' }}>
            <li><a href="/" style={{ color: '#0ea5e9' }}>→ Home Page</a></li>
            <li><a href="/auth/login" style={{ color: '#0ea5e9' }}>→ Login Page</a></li>
            <li><a href="/teacher" style={{ color: '#0ea5e9' }}>→ Teacher Dashboard (requires login)</a></li>
            <li><a href="/test-simple" style={{ color: '#0ea5e9' }}>→ Simple Test Page</a></li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '3rem',
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            <strong>Note:</strong> This page was generated at {now}. 
            If you can see this page, your Next.js server is working correctly.
          </p>
        </div>
      </body>
    </html>
  );
}
