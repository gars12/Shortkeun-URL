'use client';

import Link from 'next/link';
import { FaLink, FaChartLine, FaHistory, FaFingerprint, FaUserAlt, FaShieldAlt, FaArrowLeft, FaHome, FaCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PelajariPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Cek apakah pengguna sudah login
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950">
      {/* Navbar */}
      <nav className="backdrop-blur-md bg-opacity-20 bg-black text-white fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <FaLink className="text-white text-xs md:text-base" />
            </div>
            <span className="text-lg md:text-xl font-bold">ShortKeun URL</span>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link href={user ? "/dashboard" : "/"} className="text-blue-300 hover:text-white text-xs md:text-sm flex items-center">
              <FaHome className="mr-1" /> 
              <span className="hidden xs:inline">{user ? "Dashboard" : "Beranda"}</span>
            </Link>
            {user ? (
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/auth/logout', { method: 'POST' });
                    if (res.ok) router.push('/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 md:px-4 md:py-2 rounded-full text-white transition-all text-xs md:text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 md:px-4 md:py-2 rounded-full text-white transition-all text-xs md:text-sm"
              >
                Daftar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-6 text-sm">
            <FaArrowLeft className="mr-2" /> Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Pelajari ShortKeun URL Lebih Lanjut
          </h1>
          <p className="text-blue-200 text-sm md:text-base max-w-3xl mx-auto">
            Temukan bagaimana ShortKeun URL dapat membantu Anda mengelola dan mengoptimalkan tautan digital dengan berbagai fitur canggih.
          </p>
        </div>
      </header>

      {/* Fitur Detail */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          {/* Fitur 1: Pemendek URL */}
          <div className="mb-16 md:mb-24">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 relative">
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-blue-900/70 flex items-center justify-center">
                    <FaLink className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 pl-6">Pemendek URL</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Pemendek URL Cepat & Otomatis</h4>
                      <p className="text-blue-200 text-sm">
                        Algoritma pemendek URL kami mengubah tautan panjang menjadi URL pendek dengan cepat dan otomatis. Anda cukup memasukkan URL asli, dan dalam hitungan detik, tautan pendek siap digunakan.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Tautan yang Mudah Dibagikan</h4>
                      <p className="text-blue-200 text-sm">
                        URL pendek yang dihasilkan akan lebih mudah diingat, dibagikan, dan diketik. Sempurna untuk media sosial, email, pesan teks, atau materi cetak di mana ruang terbatas.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Dukungan untuk URL Panjang</h4>
                      <p className="text-blue-200 text-sm">
                        Tidak peduli seberapa panjang URL asli Anda, sistem kami dapat menanganinya. URL dengan parameter kompleks dan panjang akan diubah menjadi tautan pendek yang rapi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                  Cara Kerja Pemendek URL
                </h3>
                <p className="text-blue-200 text-sm mb-6">
                  Proses pemendekkan URL kami menggunakan teknik encoding canggih yang mengubah URL panjang menjadi kode singkat yang unik. Setiap kali pengguna mengakses URL pendek, mereka akan otomatis dialihkan ke URL asli.
                </p>
                <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700/30">
                  <h4 className="font-medium text-blue-300 mb-3">Langkah membuat URL pendek:</h4>
                  <ol className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <span className="bg-blue-800/50 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                      <span>Salin URL panjang yang ingin Anda pendekkan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-800/50 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                      <span>Tempel URL di kolom input pada dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-800/50 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                      <span>Opsional: Tambahkan nama kustom jika diinginkan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-800/50 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                      <span>Klik tombol "Buat URL Pendek"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-800/50 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                      <span>Salin URL pendek yang dihasilkan dan bagikan!</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Fitur 2: Custom Slug */}
          <div className="mb-16 md:mb-24">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 relative">
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-blue-900/70 flex items-center justify-center">
                    <FaFingerprint className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 pl-6">Custom Slug</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Pilih Nama URL Pendek Sendiri</h4>
                      <p className="text-blue-200 text-sm">
                        Daripada menerima kode acak, Anda dapat membuat nama kustom yang bermakna untuk URL pendek Anda. Misalnya: shortkeun.com/promo-spesial atau shortkeun.com/nama-brand.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">URL yang Mudah Diingat</h4>
                      <p className="text-blue-200 text-sm">
                        Dengan custom slug, Anda dapat membuat URL yang mudah diingat dan diucapkan, sehingga lebih mungkin untuk diketik langsung oleh pengguna tanpa perlu menyalin.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Branding yang Lebih Personal</h4>
                      <p className="text-blue-200 text-sm">
                        Custom slug memungkinkan Anda memperkuat branding dengan menggunakan kata kunci yang relevan dengan bisnis atau kampanye Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 order-2 md:order-1">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                  Keuntungan Menggunakan Custom Slug
                </h3>
                <p className="text-blue-200 text-sm mb-6">
                  Custom slug memberikan nilai tambah tidak hanya untuk branding, tetapi juga untuk analitik dan pengalaman pengguna. Tautan yang dirancang dengan baik dapat meningkatkan tingkat kepercayaan dan klik.
                </p>
                <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700/30">
                  <h4 className="font-medium text-blue-300 mb-3">Tips membuat custom slug yang efektif:</h4>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Gunakan kata kunci yang relevan dengan konten</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Buat pendek dan mudah diingat (3-5 kata)</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Hindari karakter spesial dan spasi</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Gunakan huruf kecil untuk konsistensi</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Tambahkan kata seperti 'promo', 'info', jika relevan</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fitur 3: Pelacakan Klik */}
          <div className="mb-16 md:mb-24">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 relative">
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-blue-900/70 flex items-center justify-center">
                    <FaChartLine className="text-yellow-400 text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 pl-6">Pelacakan Klik</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Analitik Real-time</h4>
                      <p className="text-blue-200 text-sm">
                        Pantau jumlah klik pada tautan Anda secara real-time. Setiap kunjungan ke URL pendek Anda akan tercatat secara instan di dashboard.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Jumlah Klik Terekam Otomatis</h4>
                      <p className="text-blue-200 text-sm">
                        Sistem kami secara otomatis menghitung dan menyimpan setiap klik yang terjadi pada URL pendek Anda, memberikan data akurat untuk analisis.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Pantau Efektivitas Tautan</h4>
                      <p className="text-blue-200 text-sm">
                        Evaluasi performa tautan Anda dari waktu ke waktu. Lihat tautan mana yang paling populer dan kapan waktu puncak aktivitas klik.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                  Data Analitik untuk Keputusan yang Lebih Baik
                </h3>
                <p className="text-blue-200 text-sm mb-6">
                  Dengan pelacakan klik, Anda memiliki data nyata untuk mengukur dampak kampanye pemasaran, efektivitas konten, atau performa saluran distribusi informasi Anda.
                </p>
                <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700/30">
                  <h4 className="font-medium text-blue-300 mb-3">Manfaat analitik klik:</h4>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Ukur performa kampanye pemasaran</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Identifikasi tren pengunjung dari waktu ke waktu</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Bandingkan tautan mana yang lebih menarik bagi audiens</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Dapatkan data untuk optimasi strategi konten</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fitur 4: URL Expiry */}
          <div className="mb-16 md:mb-24">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 relative">
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-blue-900/70 flex items-center justify-center">
                    <FaHistory className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 pl-6">URL Expiry</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Waktu Kedaluwarsa yang Dapat Disesuaikan</h4>
                      <p className="text-blue-200 text-sm">
                        Tetapkan kapan URL Anda akan kedaluwarsa. Ideal untuk promosi terbatas waktu, penawaran khusus, atau konten yang hanya relevan untuk periode tertentu.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Pilihan Unit Waktu Fleksibel</h4>
                      <p className="text-blue-200 text-sm">
                        Atur waktu kedaluwarsa dalam menit, jam, hari, minggu, atau bulan sesuai kebutuhan spesifik kampanye atau konten Anda.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Tautan Otomatis Tidak Aktif</h4>
                      <p className="text-blue-200 text-sm">
                        Setelah waktu kedaluwarsa, URL akan otomatis tidak aktif. Pengunjung yang mencoba mengaksesnya akan menerima pesan bahwa tautan sudah tidak tersedia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 order-2 md:order-1">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                  Kontrol Penuh atas Siklus Hidup Tautan
                </h3>
                <p className="text-blue-200 text-sm mb-6">
                  Fitur URL Expiry memberikan Anda kontrol penuh atas siklus hidup tautan. Ini sangat berguna untuk mengatur akses ke konten sementara atau mengelola kampanye dengan tenggat waktu.
                </p>
                <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700/30">
                  <h4 className="font-medium text-blue-300 mb-3">Kasus penggunaan URL Expiry:</h4>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Promosi flash sale dengan batas waktu</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Undangan acara atau webinar terbatas</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Dokumen rahasia dengan akses sementara</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Konten musiman yang hanya relevan untuk periode tertentu</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Trial akses yang dibatasi waktunya</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fitur 5: Autentikasi Pengguna */}
          <div className="mb-16 md:mb-24">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 relative">
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-blue-900/70 flex items-center justify-center">
                    <FaUserAlt className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 pl-6">Autentikasi Pengguna</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Daftar dan Login dengan Mudah</h4>
                      <p className="text-blue-200 text-sm">
                        Proses pendaftaran dan login yang sederhana memungkinkan Anda mulai menggunakan layanan dengan cepat. Sistem autentikasi kami menjaga keamanan akun Anda.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Kelola URL di Akun Pribadi</h4>
                      <p className="text-blue-200 text-sm">
                        Semua URL pendek yang Anda buat akan disimpan di akun Anda, memungkinkan Anda mengakses, mengedit, atau menghapusnya dari mana saja dan kapan saja.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Keamanan Data Tautan Terjamin</h4>
                      <p className="text-blue-200 text-sm">
                        Sistem autentikasi kami memastikan bahwa hanya Anda yang dapat mengelola tautan Anda, melindungi informasi penting dan data analitik dari akses tidak sah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                  Akun Pribadi untuk Pengelolaan URL yang Lebih Baik
                </h3>
                <p className="text-blue-200 text-sm mb-6">
                  Dengan akun yang terautentikasi, Anda dapat melacak semua tautan yang telah Anda buat, melihat statistiknya, dan mengelolanya dengan lebih efisien, bahkan jika bekerja di berbagai perangkat.
                </p>
                <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700/30">
                  <h4 className="font-medium text-blue-300 mb-3">Manfaat memiliki akun:</h4>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Histori lengkap semua URL yang pernah dibuat</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Kemampuan mengedit atau menghapus URL yang ada</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Akses ke data analitik klik secara lengkap</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Kemampuan mengorganisir dan mengelola banyak tautan</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Perlindungan data pribadi dan tautan sensitif</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fitur 6: Dashboard Manajemen */}
          <div>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="bg-blue-950/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 relative">
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-blue-900/70 flex items-center justify-center">
                    <FaShieldAlt className="text-blue-400 text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 pl-6">Dashboard Manajemen</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Daftar Lengkap URL Pendek</h4>
                      <p className="text-blue-200 text-sm">
                        Lihat dan kelola semua URL pendek Anda dalam satu tempat. Tampilan daftar yang intuitif memudahkan Anda menemukan tautan yang Anda butuhkan.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Salin URL dengan Satu Klik</h4>
                      <p className="text-blue-200 text-sm">
                        Tidak perlu lagi memilih dan menyalin secara manual. Dengan satu klik, URL pendek akan disalin ke clipboard Anda, siap untuk dibagikan.
                      </p>
                    </div>
                    <div className="border-l-2 border-blue-600 pl-4">
                      <h4 className="text-lg font-semibold text-blue-300 mb-2">Hapus URL yang Tidak Digunakan</h4>
                      <p className="text-blue-200 text-sm">
                        Jaga dashboard Anda tetap rapi dengan menghapus tautan yang sudah tidak diperlukan. Fitur hapus yang mudah digunakan membantu Anda mengelola ruang dengan efisien.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 order-2 md:order-1">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent">
                  Pengelolaan URL yang Efisien dan Terorganisir
                </h3>
                <p className="text-blue-200 text-sm mb-6">
                  Dashboard manajemen kami dirancang untuk memberikan pengalaman pengelolaan URL yang mulus dan efisien. Dengan antarmuka yang intuitif, Anda dapat mengelola banyak tautan dengan mudah.
                </p>
                <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700/30">
                  <h4 className="font-medium text-blue-300 mb-3">Fitur utama dashboard:</h4>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Tampilan dan filter tautan berdasarkan berbagai kriteria</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Informasi lengkap tentang setiap tautan (klik, tanggal pembuatan)</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Tombol aksi cepat untuk operasi umum (salin, hapus)</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Indikator visual status tautan (aktif, kedaluwarsa)</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheck className="text-blue-400 mt-1 mr-2" />
                      <span>Tampilan yang responsif untuk akses di desktop dan mobile</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-blue-950 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Siap Mulai Menggunakan ShortKeun URL?
          </h2>
          <p className="text-blue-200 text-sm md:text-base max-w-2xl mx-auto mb-10">
            Daftar sekarang untuk mendapatkan akses ke semua fitur canggih kami dan mulai optimalkan tautan digital Anda dengan lebih efektif.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/30 text-sm md:text-base"
            >
              Daftar Sekarang - Gratis
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-transparent border border-blue-500/30 text-blue-400 rounded-full hover:bg-blue-500/10 transition-all text-sm md:text-base"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 md:py-8 text-center text-blue-300/50 text-xs md:text-sm bg-blue-950">
        © {new Date().getFullYear()} ShortKeun URL. All rights reserved.
      </footer>
    </div>
  );
} 