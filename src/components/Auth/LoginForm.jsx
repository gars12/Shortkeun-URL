'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaLink, FaExclamationTriangle } from 'react-icons/fa';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [userId, setUserId] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Cek apakah pengguna sudah login
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        
        // Jika pengguna sudah login, redirect ke dashboard
        if (response.ok && data.user) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    }
    
    checkAuthStatus();
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowVerificationAlert(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        // Cek apakah error karena email belum diverifikasi
        if (data.message && data.message.includes('Email belum diverifikasi')) {
          setShowVerificationAlert(true);
          
          // Coba dapatkan userId untuk keperluan kirim ulang email verifikasi
          try {
            const userRes = await fetch('/api/auth/get-user-by-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: formData.email })
            });
            
            const userData = await userRes.json();
            if (userRes.ok && userData.user) {
              setUserId(userData.user.id);
            }
          } catch (userError) {
            console.error('Error mendapatkan user ID:', userError);
          }
        }
        
        throw new Error(data.message || 'Terjadi kesalahan saat login');
      }

      // Redirect ke dashboard setelah login berhasil
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk mengirim ulang email verifikasi
  const handleResendVerification = async () => {
    if (!userId) {
      setError('Tidak dapat mengirim email verifikasi. Silakan coba lagi nanti.');
      return;
    }
    
    setResendLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat mengirim ulang email verifikasi');
      }

      alert('Email verifikasi telah dikirim ulang. Silakan cek inbox email Anda.');
    } catch (error) {
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4">
      <Link href="/" className="flex items-center space-x-2 mb-8 group">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
          <FaLink className="text-white text-sm md:text-xl" />
        </div>
        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
          ShortKeun URL
        </span>
      </Link>
      
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-5 md:p-8">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-white mb-4 md:mb-6">Login ke Akun</h2>
        <p className="text-center text-sm md:text-base text-blue-300 mb-8">
          Masuk untuk mengakses dashboard dan fitur lengkap
        </p>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-6 flex items-center text-sm md:text-base">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
            {error}
          </div>
        )}
        
        {showVerificationAlert && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-300 px-3 py-4 md:px-4 md:py-5 rounded-lg mb-6 text-sm md:text-base">
            <div className="flex items-center mb-2">
              <FaExclamationTriangle className="mr-2 text-yellow-400" />
              <span className="font-semibold">Email belum diverifikasi</span>
            </div>
            <p className="mb-3">Silakan cek inbox email Anda untuk link verifikasi yang telah dikirim sebelumnya.</p>
            <button 
              onClick={handleResendVerification}
              disabled={resendLoading || !userId}
              className="w-full py-2 bg-yellow-800/50 hover:bg-yellow-800/70 border border-yellow-600/50 rounded-md text-yellow-200 transition-colors"
            >
              {resendLoading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 md:mb-6">
            <label className="block text-blue-300 text-xs md:text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <div className="flex overflow-hidden rounded-lg border border-blue-700/30 bg-blue-900/20">
              <div className="flex items-center justify-center px-3 text-blue-500/80 border-r border-blue-700/30">
                <FaEnvelope className="text-sm" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-transparent text-white text-sm flex-1 p-2.5 md:p-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="nama@example.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-blue-300 text-xs md:text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-xs md:text-sm text-blue-400 hover:text-blue-300">
                Lupa password?
              </a>
            </div>
            <div className="flex overflow-hidden rounded-lg border border-blue-700/30 bg-blue-900/20">
              <div className="flex items-center justify-center px-3 text-blue-500/80 border-r border-blue-700/30">
                <FaLock className="text-sm" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent text-white text-sm flex-1 p-2.5 md:p-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 md:py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="relative w-5 h-5 mr-2">
                    <svg className="w-5 h-5 absolute top-0 left-0 animate-spin" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="rgba(255,255,255,0.3)" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        d="M12 2a10 10 0 0 1 10 10"
                      />
                    </svg>
                  </div>
                  <span>Login...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt className="text-base" />
                  <span>Login</span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center text-xs md:text-sm">
              <span className="text-blue-300">Belum punya akun?</span>
              <Link href="/register" className="text-blue-400 hover:text-blue-300 ml-2 font-medium flex items-center">
                <span>Daftar</span>
                <FaUserPlus className="ml-1" />
              </Link>
            </div>
          </div>
        </form>
      </div>
      
      {/* Network Nodes (Decorative) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="connection-lines"></div>
      </div>
    </div>
  );
} 