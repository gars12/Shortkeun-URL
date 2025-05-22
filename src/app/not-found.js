export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'medium', marginBottom: '1.5rem' }}>Halaman tidak ditemukan</h2>
      <p style={{ marginBottom: '2rem' }}>Maaf, halaman yang Anda cari tidak dapat ditemukan.</p>
      <a 
        href="/"
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.375rem',
          textDecoration: 'none'
        }}
      >
        Kembali ke Beranda
      </a>
    </div>
  );
} 