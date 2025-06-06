// src/components/Auth/RegisterForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaUserPlus, FaUser, FaLink, FaSignInAlt } from 'react-icons/fa'; 

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            router.push('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
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
    setRegistrationSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat registrasi');
      }
      
      setRegistrationSuccess(true); 
      // Anda bisa langsung redirect ke login atau dashboard di sini jika mau
      // router.push('/login');

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        {registrationSuccess ? (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <FaUserPlus className="text-green-400 text-2xl" />
            </div>
            <h2 className="text-center text-2xl md:text-3xl font-extrabold text-white mb-4">Registrasi Berhasil!</h2>
            <p className="text-blue-200 text-sm md:text-base mb-6">
              Akun Anda telah berhasil dibuat. Anda sekarang dapat login.
            </p>
            <div className="flex flex-col space-y-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 md:py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                <FaSignInAlt className="mr-2" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-center text-2xl md:text-3xl font-extrabold text-white mb-4 md:mb-6">Daftar Akun</h2>
            <p className="text-center text-sm md:text-base text-blue-300 mb-8">
              Daftar untuk mendapatkan akses ke semua fitur lengkap
            </p>
            
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-6 flex items-center text-sm md:text-base">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4 md:mb-6">
                <label className="block text-blue-300 text-xs md:text-sm font-semibold mb-2" htmlFor="name">
                  Nama
                </label>
                <div className="flex overflow-hidden rounded-lg border border-blue-700/30 bg-blue-900/20">
                  <div className="flex items-center justify-center px-3 text-blue-500/80 border-r border-blue-700/30">
                    <FaUser className="text-sm" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-transparent text-white text-sm flex-1 p-2.5 md:p-3 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nama Lengkap"
                    required
                  />
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-blue-300 text-xs md:text-sm font-semibold mb-2" htmlFor="email">
                  Email
                </label>
                <div className="flex overflow-hidden rounded-lg border border-blue-700/30 bg-blue-900/20">
                  <div className="flex items-center justify-center px-3 text-blue-500/80 border-r border-blue-700/30">
                    <FaUser className="text-sm" /> {/* Mengganti FaEnvelope */}
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

              <div className="mb-4 md:mb-6">
                <label className="block text-blue-300 text-xs md:text-sm font-semibold mb-2" htmlFor="password">
                  Password
                </label>
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
                    minLength={6}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-blue-300 text-xs md:text-sm font-semibold mb-2" htmlFor="confirmPassword">
                  Konfirmasi Password
                </label>
                <div className="flex overflow-hidden rounded-lg border border-blue-700/30 bg-blue-900/20">
                  <div className="flex items-center justify-center px-3 text-blue-500/80 border-r border-blue-700/30">
                    <FaLock className="text-sm" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
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
                    <span>Mendaftar...</span>
                  ) : (
                    <>
                      <FaUserPlus />
                      <span>Daftar Sekarang</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center text-xs md:text-sm">
                  <span className="text-blue-300">Sudah punya akun?</span>
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 ml-2 font-medium flex items-center">
                    <span>Login</span>
                    <FaSignInAlt className="ml-1" />
                  </Link>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
      
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="connection-lines"></div>
      </div>
    </div>
  );
}
