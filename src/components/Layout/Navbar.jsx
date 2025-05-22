'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaLink, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

export default function Navbar({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Terjadi kesalahan saat logout');
      }

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="backdrop-blur-md bg-opacity-10 bg-black text-white border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <FaLink className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
              ShortKeun URL
            </span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-md hover:bg-white/10 focus:outline-none"
            >
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center space-x-2 hover:text-blue-300 transition-colors">
                  <FaTachometerAlt />
                  <span>Dashboard</span>
                </Link>
                
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-700/30 rounded-full flex items-center justify-center text-blue-300">
                    <FaUser className="text-sm" />
                  </div>
                  <span className="text-sm text-blue-200">{user.name || 'User'}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center space-x-2 text-red-300 hover:text-red-200 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>{loading ? 'Logout...' : 'Logout'}</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-blue-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 rounded-full text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow hover:shadow-blue-500/20"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 mt-3 space-y-3">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-2 p-2 rounded hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaTachometerAlt />
                  <span>Dashboard</span>
                </Link>
                
                <div className="flex items-center space-x-2 p-2">
                  <div className="h-8 w-8 bg-blue-700/30 rounded-full flex items-center justify-center text-blue-300">
                    <FaUser className="text-sm" />
                  </div>
                  <span className="text-sm text-blue-200">{user.name || 'User'}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center space-x-2 text-red-300 hover:text-red-200 transition-colors w-full p-2 rounded hover:bg-white/10 text-left"
                >
                  <FaSignOutAlt />
                  <span>{loading ? 'Logout...' : 'Logout'}</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block p-2 rounded hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block p-2 rounded bg-blue-600 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 