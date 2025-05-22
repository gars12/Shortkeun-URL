'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mencegah caching agar setiap pengunjungan URL dihitung sebagai klik baru
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ShortUrlRedirect({ params }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function performRedirect() {
      try {
        const { slug } = params;
        console.log(`[ShortUrlPage] Redirecting for slug: ${slug}`);
        
        // Langsung redirect ke API endpoint dengan kode yang sama
        // API endpoint akan menangani semuanya (pencarian URL, increment klik, dan redirect)
        window.location.href = `/api/shorturl/redirect/${slug}`;
      } catch (err) {
        console.error('Error during redirect:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    performRedirect();
  }, [params]);
  
  // Tampilkan loading jika masih dalam proses
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center text-white p-4">
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl text-blue-200">Mengalihkan ke URL asli...</h2>
        </div>
      </div>
    );
  }
  
  // Tampilkan error jika terjadi masalah
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center text-white p-4">
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Terjadi Kesalahan</h1>
        <p className="text-blue-200 mb-6">Maaf, terjadi kesalahan saat memproses URL pendek.</p>
        <pre className="bg-gray-900/30 p-4 rounded mb-6 text-xs text-left overflow-auto">
          {error || "Kesalahan tidak diketahui"}
        </pre>
        <a href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full inline-block">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
} 