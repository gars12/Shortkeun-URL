'use client';

import Link from 'next/link';
import { FaLink, FaChartLine, FaShieldAlt, FaArrowRight, FaChevronDown, FaCheck, FaRegStar, FaStar, FaHistory, FaFingerprint, FaUserAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  
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
  
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="backdrop-blur-md bg-opacity-20 bg-black text-white fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <FaLink className="text-white text-xs md:text-base" />
            </div>
            <span className="text-lg md:text-xl font-bold">ShortKeun URL</span>
          </div>
          <div className="space-x-2 md:space-x-4">
            <Link href="/login" className="text-blue-300 hover:text-white text-sm md:text-base">
              Login
            </Link>
            <Link
          href="/register" 
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-white transition-all text-sm md:text-base"
        >
          Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Height */}
      <section className="min-h-screen flex flex-col justify-center pt-16 relative overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="container mx-auto px-4 text-white z-10 flex flex-col md:flex-row items-center py-12 md:py-0">
          <div className="md:w-1/2 text-left mb-8 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text leading-tight">
              Pendekkan URL, <br />Perluas Jangkauan Anda
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-blue-200 mb-8">
              Platform pemendek URL modern dengan analitik lengkap dan fitur-fitur keamanan. 
              Pantau kinerja tautan Anda dengan mudah dan efisien.
            </p>
            
            <div className="flex justify-start">
              <Link
                href="#landscape"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/30 text-sm md:text-base flex items-center"
              >
                <span>Jelajahi Fitur</span>
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative flex justify-center">
            {/* Hero 3D Object/Ilustration */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-600/40 backdrop-blur-3xl shadow-2xl"></div>
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 backdrop-blur-3xl transform rotate-45"></div>
              <div className="absolute inset-16 rounded-full bg-gradient-to-tl from-blue-300/20 to-purple-400/20 backdrop-blur-3xl"></div>
            </div>
            
            {/* Decorative Floating Elements */}
            <div className="absolute top-10 right-10 w-10 h-10 rounded-full bg-yellow-400/30 backdrop-blur-xl animate-float-delay"></div>
            <div className="absolute bottom-10 left-16 w-6 h-6 rounded-full bg-purple-400/30 backdrop-blur-xl animate-float-slow"></div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#0f172a" fillOpacity="1" d="M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,122.7C840,128,960,160,1080,165.3C1200,171,1320,149,1380,138.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce z-10">
          <a href="#landscape" className="text-blue-300 hover:text-blue-100 transition-colors">
            <FaChevronDown className="h-5 w-5 md:h-6 md:w-6" />
          </a>
        </div>
      </section>

      {/* Current Landscape Section */}
      <section id="landscape" className="bg-slate-900 py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                Kemudahan Berbagi Tautan <br />di Era Digital
              </h2>
              <p className="text-blue-200 text-sm md:text-base mb-4">
                ShortKeun URL menyediakan solusi pemendek URL yang mudah dan efisien. 
                Anda dapat membuat, mengelola, dan melacak tautan pendek dengan 
                antarmuka yang intuitif dan fitur-fitur canggih.
              </p>
              <p className="text-blue-200 text-sm md:text-base">
                Platform kami dirancang untuk memenuhi kebutuhan pribadi maupun bisnis,
                dengan fitur keamanan terbaik dan analitik lengkap untuk mengoptimalkan
                jangkauan konten digital Anda.
              </p>
            </div>
            
            <div className="md:w-1/2 relative flex justify-center">
              {/* Floating planets decoration */}
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="0.05" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Portfolio/Features Section with White Background */}
      <section className="bg-gradient-to-b from-slate-900/95 to-slate-900 py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/5 mb-10 md:mb-0">
              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-md p-6 md:p-8 rounded-3xl relative w-64 h-64 mx-auto">
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center">
                  <FaLink className="text-blue-400" />
                </div>
                <div className="h-full w-full bg-blue-950/30 rounded-2xl flex items-center justify-center">
                  <img src="/logos.jpg" alt="ShortKeun Logo" className="w-50 h-50 opacity-75 rounded-2xl" />
                </div>
              </div>
            </div>
            
            <div className="md:w-3/5">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                Bangun Tautan yang Lebih Baik Bersama Kami
              </h2>
              <p className="text-blue-200 text-sm md:text-base mb-6">
                ShortKeun URL memudahkan Anda membuat tautan pendek yang efektif.
                Dengan antarmuka yang intuitif dan fitur-fitur canggih, Anda dapat mengelola
                dan melacak semua tautan Anda dalam satu tempat.
              </p>
              <p className="text-blue-200 text-sm md:text-base mb-8">
                Platform kami dirancang untuk memberikan pengalaman terbaik dalam
                pemendek URL, dari analitik lengkap hingga keamanan premium.
              </p>
              
              <a href="#fitur" className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-sm font-medium transition-all">
                <span>Lihat Fitur Lengkap</span>
                <FaArrowRight className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="bg-slate-900 py-16 md:py-24 relative">
        <div className="container mx-auto px-4 text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
            Fitur Unggulan ShortKeun URL
          </h2>
          <p className="text-blue-200 text-sm md:text-base max-w-2xl mx-auto">
            Nikmati berbagai fitur canggih yang kami sediakan untuk memudahkan pengelolaan tautan Anda
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 container mx-auto px-4">
          {/* Fitur 1: Pemendek URL */}
          <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center hover:translate-y-[-5px] transition-all">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-900/50 flex items-center justify-center">
                <FaLink className="text-blue-400 text-xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Pemendek URL</h3>
            <p className="text-blue-300 text-sm mb-4">Ubah URL panjang menjadi tautan pendek</p>
            <ul className="text-left text-blue-200 text-sm space-y-3 mb-6">
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Pemendek URL cepat & otomatis</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Tautan yang mudah dibagikan</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Dukungan untuk URL panjang</span>
              </li>
            </ul>
          </div>
          
          {/* Fitur 2: Custom Slug */}
          <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center transform hover:translate-y-[-5px] transition-all relative z-10 shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-800/50 flex items-center justify-center">
                <FaFingerprint className="text-blue-400 text-xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Custom Slug</h3>
            <p className="text-blue-300 text-sm mb-4">Buat URL dengan nama khusus</p>
            <ul className="text-left text-blue-200 text-sm space-y-3 mb-6">
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Pilih nama URL pendek sendiri</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>URL yang mudah diingat</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Branding yang lebih personal</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Validasi slug otomatis</span>
              </li>
            </ul>
          </div>
          
          {/* Fitur 3: Pelacakan Klik */}
          <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center hover:translate-y-[-5px] transition-all">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-900/50 flex items-center justify-center">
                <FaChartLine className="text-yellow-400 text-xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Pelacakan Klik</h3>
            <p className="text-blue-300 text-sm mb-4">Pantau jumlah kunjungan tautan</p>
            <ul className="text-left text-blue-200 text-sm space-y-3 mb-6">
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Analitik real-time</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Jumlah klik terekam otomatis</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Pantau efektivitas tautan</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Dashboard yang informatif</span>
              </li>
            </ul>
          </div>

          {/* Fitur 4: URL Expiry */}
          <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center hover:translate-y-[-5px] transition-all">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-900/50 flex items-center justify-center">
                <FaHistory className="text-blue-400 text-xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">URL Expiry</h3>
            <p className="text-blue-300 text-sm mb-4">Atur masa aktif tautan</p>
            <ul className="text-left text-blue-200 text-sm space-y-3 mb-6">
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Waktu kedaluwarsa yang dapat disesuaikan</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Pilihan unit waktu fleksibel</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Tautan otomatis tidak aktif setelah expired</span>
              </li>
            </ul>
          </div>

          {/* Fitur 5: Autentikasi Pengguna */}
          <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center hover:translate-y-[-5px] transition-all">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-900/50 flex items-center justify-center">
                <FaUserAlt className="text-blue-400 text-xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Autentikasi Pengguna</h3>
            <p className="text-blue-300 text-sm mb-4">Kelola tautan pribadi dengan aman</p>
            <ul className="text-left text-blue-200 text-sm space-y-3 mb-6">
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Daftar dan login dengan mudah</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Kelola URL di akun pribadi</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Keamanan data tautan terjamin</span>
              </li>
            </ul>
          </div>

          {/* Fitur 6: Dashboard Manajemen */}
          <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center hover:translate-y-[-5px] transition-all">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-900/50 flex items-center justify-center">
                <FaShieldAlt className="text-blue-400 text-xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Dashboard Manajemen</h3>
            <p className="text-blue-300 text-sm mb-4">Kelola semua tautan dalam satu tempat</p>
            <ul className="text-left text-blue-200 text-sm space-y-3 mb-6">
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Daftar lengkap URL pendek</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Salin URL dengan satu klik</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-blue-400 mt-1 mr-2" />
                <span>Hapus URL yang tidak digunakan</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-b from-slate-900 to-blue-950 py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Wujudkan Potensi Digital Anda
          </h2>
          <p className="text-blue-200 text-sm md:text-base max-w-2xl mx-auto mb-8">
            Bergabunglah dengan ribuan pengguna yang telah memaksimalkan jangkauan digital mereka dengan ShortKeun URL.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/30 text-sm md:text-base"
            >
              Daftar Gratis
            </Link>
            <Link href="/pelajari" className="px-6 py-3 bg-transparent border border-blue-500/30 text-blue-400 rounded-full hover:bg-blue-500/10 transition-all text-sm md:text-base">
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* Network Visualization Animation */}
      <div className="network-nodes fixed inset-0 -z-10 opacity-30 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="node"></div>
        ))}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-6 md:py-8 text-center text-blue-300/50 text-xs md:text-sm bg-blue-950">
        © {new Date().getFullYear()} ShortKeun URL. All rights reserved.
      </footer>
    </div>
  );
} 