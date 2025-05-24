'use client';

import { useEffect, useState } from 'react';
// useRouter tidak digunakan secara langsung di sini, bisa dihapus jika tidak ada rencana penggunaan
// import { useRouter } from 'next/navigation'; 

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ShortUrlRedirect({ params }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function performRedirect() {
      try {
        const { slug } = params;
        if (slug) {
          window.location.href = `/api/shorturl/redirect/${slug}`;
        } else {
          // Seharusnya tidak terjadi jika slug adalah parameter path
          throw new Error("Slug tidak ditemukan.");
        }
      } catch (err) {
        // console.error('Error during redirect initiation:', err); // Hapus di production
        setError(err.message || "Terjadi kesalahan saat memulai redirect.");
        setLoading(false);
      }
    }
    
    if (params.slug) {
      performRedirect();
    } else {
      setError("Parameter slug tidak valid.");
      setLoading(false);
    }
  }, [params]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center text-white p-4">
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl text-blue-200">Mengalihkan...</h2>
        </div>
      </div>
    );
  }
  
  // Hanya tampilkan error jika loading selesai dan ada error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center text-white p-4">
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Gagal Mengalihkan</h1>
          <p className="text-blue-200 mb-6">{error}</p>
          <a href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full inline-block">
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return null; // Atau fallback UI lain jika diperlukan sebelum redirect selesai
}
