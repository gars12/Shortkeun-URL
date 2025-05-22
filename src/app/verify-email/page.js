'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaLink, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaEnvelope } from 'react-icons/fa';
import Toast from '../../components/Notification/Toast';


export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  const handleCloseToast = () => {
    setToast({ ...toast, show: false });
  };

  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
  };
  
  useEffect(() => {
    // Jika tidak ada token, tampilkan pesan error
    if (!token) {
      setLoading(false);
      setError('Token verifikasi tidak valid atau hilang.');
      showToast('Token verifikasi tidak valid atau hilang.', 'error');
      return;
    }
    
    // Verifikasi token
    async function verifyToken() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || 'Terjadi kesalahan saat verifikasi email.');
          showToast(data.message || 'Terjadi kesalahan saat verifikasi email.', 'error');
          setLoading(false);
          return;
        }
        
        setSuccess(true);
        setMessage(data.message || 'Email berhasil diverifikasi.');
        showToast(data.message || 'Email berhasil diverifikasi!', 'success');
      } catch (error) {
        console.error('Error verifikasi email:', error);
        setError('Terjadi kesalahan saat verifikasi email. Silakan coba lagi.');
        showToast('Terjadi kesalahan saat verifikasi email. Silakan coba lagi.', 'error');
      } finally {
        setLoading(false);
      }
    }
    
    verifyToken();
  }, [token]);

  // Timer untuk redirect ke halaman login setelah verifikasi berhasil
  useEffect(() => {
    let redirectTimer;
    
    if (success) {
      redirectTimer = setTimeout(() => {
        router.push('/login');
      }, 5000); // Redirect setelah 5 detik
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [success, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 flex flex-col items-center justify-center px-4">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={handleCloseToast}
        duration={4000}
      />
      
      {/* Logo dan Brand */}
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2 mb-8 group">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <FaLink className="text-white text-sm md:text-xl" />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
            ShortKeun URL
          </span>
        </Link>
      </div>
      
      {/* Card Verifikasi */}
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-white mb-4 md:mb-6">
          Verifikasi Email
        </h2>
        
        <div className="text-center mb-6">
          {loading && (
            <div className="flex flex-col items-center">
              <FaSpinner className="text-blue-400 text-4xl animate-spin mb-4" />
              <p className="text-blue-300">Memverifikasi email...</p>
            </div>
          )}
          
          {success && (
            <div className="flex flex-col items-center">
              <FaCheckCircle className="text-green-400 text-5xl mb-4" />
              <p className="text-green-300">{message}</p>
              <div className="mt-4 p-3 bg-blue-900/30 rounded-lg text-blue-200 text-sm">
                Anda akan otomatis dialihkan ke halaman login dalam 5 detik...
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-red-400 text-5xl mb-4" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            <span>Login Sekarang</span>
          </Link>
          
          {error && (
            <div className="w-full flex items-center justify-center space-x-2 bg-transparent border border-blue-700/30 text-blue-400 py-3 px-4 rounded-lg text-sm md:text-base hover:bg-blue-900/20 transition-all cursor-pointer"
              onClick={() => router.push('/')}>
              <FaEnvelope className="mr-2" />
              <span>Kembali ke Beranda</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="connection-lines"></div>
      </div>
    </div>
  );
} 