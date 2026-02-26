export default function TestSimplePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ color: 'green', fontSize: '2rem', marginBottom: '1rem' }}>
        ✓ Next.js Server is Working!
      </h1>
      <p style={{ marginBottom: '0.5rem' }}>
        If you can see this page, the Next.js server is running correctly.
      </p>
      <p style={{ marginBottom: '0.5rem' }}>
        Current time: {new Date().toISOString()}
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Test Links:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
              → Home Page
            </a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <a href="/auth/login" style={{ color: 'blue', textDecoration: 'underline' }}>
              → Login Page
            </a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <a href="/teacher" style={{ color: 'blue', textDecoration: 'underline' }}>
              → Teacher Page (requires login)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
