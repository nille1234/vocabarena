export default function TestPage() {
  return (
    <div style={{ padding: '32px', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>Test Page</h1>
      <p style={{ fontSize: '18px', color: '#ffffff' }}>If you can see this, the app is working!</p>
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#ff0000', color: '#ffffff' }}>
        RED BOX - If you see this red box, CSS is working
      </div>
    </div>
  );
}
