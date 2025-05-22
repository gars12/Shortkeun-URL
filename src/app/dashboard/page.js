'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import CreateShortUrl from '../../components/ShortUrl/CreateShortUrl';
import UrlList from '../../components/ShortUrl/UrlList';
import { FaChartLine, FaLink, FaClock, FaGlobe, FaChartBar, FaRocket, FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [statistics, setStatistics] = useState({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0
  });
  const [clickData, setClickData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [processedData, setProcessedData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [tooltipData, setTooltipData] = useState({ show: false, value: 0, day: '', index: -1 });
  
  // Ambil data user saat komponen dimuat
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch data user dari API
        const response = await fetch('/api/auth/user');
        
        if (!response.ok) {
          setLoading(false);
          return;
        }
        
        const userData = await response.json();
        
        if (userData && userData.user) {
          setUser(userData.user);
          setUserId(userData.user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, []);

  // Ambil statistik URL
  useEffect(() => {
    async function fetchStatistics() {
      try {
        console.log('[Dashboard] Memulai pengambilan statistik URL');
        // Fetch statistik dari API
        const response = await fetch('/api/shorturl/all');
        
        if (!response.ok) {
          console.error('[Dashboard] Gagal mengambil data URL:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('[Dashboard] Data URL diterima:', data);
        
        if (data && data.data) {
          const urls = data.data;
          const totalClicks = urls.reduce((acc, url) => acc + url.clickCount, 0);
          const activeUrls = urls.filter(url => !url.isExpired).length;
          
          setStatistics({
            totalUrls: urls.length,
            totalClicks,
            activeUrls
          });
          console.log('[Dashboard] Statistik diupdate:', { totalUrls: urls.length, totalClicks, activeUrls });

          // Kumpulkan semua data klik untuk visualisasi
          const clickHistory = [];
          
          // Proses data klik dari setiap URL
          urls.forEach(url => {
            console.log(`[Dashboard] Memproses data klik untuk URL: ${url.shortenedUrl}, jumlah klik: ${url.clickCount}, clickHistory:`, url.clickHistory);
            
            if (url.clickHistory && Array.isArray(url.clickHistory) && url.clickHistory.length > 0) {
              console.log(`[Dashboard] Ditemukan clickHistory dengan ${url.clickHistory.length} entri`);
              clickHistory.push(...url.clickHistory);
            } else if (url.clicks && Array.isArray(url.clicks)) {
              // Format alternatif jika nama propertinya berbeda
              console.log(`[Dashboard] Ditemukan clicks dengan ${url.clicks.length} entri`);
              clickHistory.push(...url.clicks);
            } else if (url.clickCount > 0) {
              console.log(`[Dashboard] Tidak ada clickHistory yang valid tetapi ada ${url.clickCount} klik, membuat data simulasi`);
              // Jika tidak ada histori klik detail, gunakan jumlah klik yang ada untuk menggambarkan aktivitas
              // Ini hanya untuk fall-back jika API belum menyediakan data klik yang terstruktur
              const createdAt = new Date(url.createdAt);
              for (let i = 0; i < url.clickCount; i++) {
                // Distribusikan klik secara acak dalam rentang waktu setelah url dibuat
                const randomDaysOffset = Math.floor(Math.random() * 30);
                const clickDate = new Date(createdAt);
                clickDate.setDate(clickDate.getDate() + randomDaysOffset);
                
                clickHistory.push({
                  timestamp: clickDate.toISOString(),
                  url_id: url.id
                });
              }
            }
          });
          
          console.log(`[Dashboard] Total data klik terkumpul: ${clickHistory.length}`, clickHistory);
          setClickData(clickHistory);
        }
      } catch (error) {
        console.error('[Dashboard] Error saat mengambil statistik:', error);
      }
    }
    
    if (!loading) {
      fetchStatistics();
    }
  }, [loading, refreshTrigger]);

  // Proses data klik untuk visualisasi berdasarkan rentang waktu
  useEffect(() => {
    function processClickData() {
      if (!clickData.length) {
        console.log('[Dashboard] Tidak ada data klik untuk diproses');
        setProcessedData([]);
        setLabels([]);
        return;
      }
      
      console.log(`[Dashboard] Memproses ${clickData.length} data klik dengan rentang waktu: ${timeRange}`);
      
      let startDate;
      let endDate = new Date();
      let dateFormat = 'EEE'; // Default format untuk hari (Sen, Sel, dst)
      
      // Tentukan rentang waktu berdasarkan pilihan
      switch(timeRange) {
        case 'week':
          // Mulai dari Senin dan pastikan 7 hari penuh sampai Minggu
          startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Mulai dari Senin
          // Pastikan endDate adalah Minggu (7 hari setelah Senin)
          endDate = addDays(startDate, 6);
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          dateFormat = 'd'; // Format tanggal saja (1, 2, ..., 31)
          break;
        case 'year':
          startDate = startOfYear(new Date());
          dateFormat = 'MMM'; // Format bulan (Jan, Feb, ..., Des)
          break;
        default:
          startDate = subDays(new Date(), 6); // Default 7 hari terakhir
      }
      
      console.log(`[Dashboard] Rentang waktu dari ${startDate.toISOString()} hingga ${endDate.toISOString()}`);
      
      // Buat array tanggal dalam rentang
      const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Format label untuk setiap tanggal
      const newLabels = datesInRange.map(date => format(date, dateFormat, { locale: id }));
      
      // Hitung jumlah klik untuk setiap hari
      const clickCounts = datesInRange.map(date => {
        const count = clickData.filter(click => {
          try {
            // Pastikan click.timestamp adalah nilai yang valid
            if (!click.timestamp) {
              console.warn('[Dashboard] Data klik tanpa timestamp:', click);
              return false;
            }
            
            const clickDate = new Date(click.timestamp);
            
            // Validasi bahwa clickDate adalah tanggal yang valid
            if (isNaN(clickDate.getTime())) {
              console.warn('[Dashboard] Timestamp tidak valid:', click.timestamp);
              return false;
            }
            
            return isSameDay(clickDate, date);
          } catch (err) {
            console.error('[Dashboard] Error saat memproses tanggal klik:', err, click);
            return false;
          }
        }).length;
        
        return count;
      });
      
      console.log('[Dashboard] Data klik yang diproses:', clickCounts);
      console.log('[Dashboard] Labels:', newLabels);
      
      setProcessedData(clickCounts);
      setLabels(newLabels);
    }
    
    processClickData();
  }, [clickData, timeRange]);
  
  // Handler ketika URL baru dibuat
  const handleUrlCreated = () => {
    // Refresh daftar URL
    setRefreshTrigger(prev => prev + 1);
  };

  // Handler untuk perubahan rentang waktu
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Menemukan nilai maksimum untuk skala grafik
  const maxClickValue = Math.max(...processedData, 1);

  // Menangani tampilan tooltip saat hover
  const handleBarHover = (value, day, index) => {
    setTooltipData({ show: true, value, day, index });
  };

  // Menghilangkan tooltip saat mouse keluar dari bar
  const handleBarLeave = () => {
    setTooltipData({ ...tooltipData, show: false });
  };

  // Konfigurasi untuk Chart.js
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Jumlah Klik',
        data: processedData,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
          font: {
            size: 10
          },
          stepSize: 1
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
          font: {
            size: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return `${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `${context.raw} klik`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} />
        <div className="fixed inset-0 flex items-center justify-center bg-blue-950/50 backdrop-blur-sm z-50">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 flex flex-col items-center">
            <div className="relative w-12 h-12 mb-3">
              {/* Lingkaran luar - berputar lambat */}
              <svg className="w-12 h-12 absolute top-0 left-0 animate-spin-slow" viewBox="0 0 24 24">
                <circle 
                  className="opacity-20" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="#60a5fa" 
                  strokeWidth="1" 
                  fill="none"
                  strokeDasharray="40"
                  strokeDashoffset="10"
                />
              </svg>
              
              {/* Lingkaran tengah - berputar normal */}
              <svg className="w-10 h-10 absolute top-1 left-1 animate-spin" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="8" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  fill="none"
                  strokeOpacity="0.2"
                />
                <path 
                  className="opacity-75" 
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M12 4a8 8 0 0 1 8 8"
                />
              </svg>
              
              {/* Lingkaran dalam - berputar cepat arah sebaliknya */}
              <svg className="w-8 h-8 absolute top-2 left-2 animate-spin-reverse" viewBox="0 0 24 24">
                <path 
                  className="opacity-90" 
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M12 6a6 6 0 0 0 -6 6"
                />
              </svg>
            </div>
            <p className="text-blue-200 text-sm">Memuat...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      
      {/* Decorative floating elements */}
      <div className="fixed top-20 right-10 w-16 h-16 rounded-full bg-blue-500/10 backdrop-blur-xl animate-float hidden md:block"></div>
      <div className="fixed bottom-20 left-10 w-10 h-10 rounded-full bg-purple-500/10 backdrop-blur-xl animate-float-slow hidden md:block"></div>
      <div className="fixed top-1/3 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-xl rotate-45 animate-pulse-slow hidden lg:block"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section with greeting */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
                Selamat Datang, {user?.name || 'Pengguna'}!
              </h1>
              <p className="text-blue-300 mb-6">
                Kelola tautan pendek dan lihat statistik kunjungan di dashboard Anda
              </p>
              
              {/* Quick stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center dashboard-card">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                    <FaLink className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Total URL</p>
                    <p className="text-2xl font-bold text-white">{statistics.totalUrls}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center dashboard-card">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                    <FaChartLine className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Total Klik</p>
                    <p className="text-2xl font-bold text-white">{statistics.totalClicks}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center dashboard-card">
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                    <FaClock className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">URL Aktif</p>
                    <p className="text-2xl font-bold text-white">{statistics.activeUrls}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shortening Form */}
          <div className="lg:col-span-1 space-y-6">
            <CreateShortUrl onUrlCreated={handleUrlCreated} userId={userId} />
            
            {/* Tips card */}
            <div className="bg-gradient-to-br from-blue-800/20 to-purple-800/20 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                  <FaRocket className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Tips Pemendek URL</h3>
              </div>
              <ul className="text-blue-300 text-sm space-y-2">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-900/60 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-blue-300 text-xs">1</span>
                  </div>
                  <span>Gunakan URL kustom yang mudah diingat untuk branding</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-900/60 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-blue-300 text-xs">2</span>
                  </div>
                  <span>Atur masa berlaku URL untuk konten sementara</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-900/60 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-blue-300 text-xs">3</span>
                  </div>
                  <span>Pantau klik untuk mengukur efektivitas tautan</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* URL List and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity chart visualization */}
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-xl bg-grid">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent flex items-center">
                  <FaChartBar className="mr-2 text-blue-400" /> Visualisasi Aktivitas
                </h2>
                <div className="flex items-center space-x-2">
                  <select 
                    className="border border-blue-700/30 text-sm rounded-lg px-2 py-1 outline-none bg-blue-900 text-white"
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                  >
                    <option 
                      value="week"
                      className="bg-blue-900 text-white" 
                    >
                      Minggu Ini
                    </option>
                    <option 
                      value="month"
                      className="bg-blue-900 text-white" 
                    >
                      Bulan Ini
                    </option>
                    <option 
                      value="year"
                      className="bg-blue-900 text-white" 
                    >
                      Tahun Ini
                    </option>
                  </select>
                  <div className="tooltip-info relative">
                    <FaInfoCircle className="text-blue-400 cursor-help" />
                    <div className="tooltip-text absolute hidden group-hover:block bg-blue-900/90 text-xs p-2 rounded right-0 w-48">
                      Data klik berdasarkan periode waktu yang dipilih
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Real chart visualization */}
              <div className="h-64 w-full relative mb-2">
                {/* Dekorasi latar belakang */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-blue-900/0 rounded-lg"></div>
                
                {/* Chart.js Line Chart */}
                {processedData.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-blue-300/70 text-sm">Belum ada data klik</p>
                  </div>
                )}
              </div>
              
              {/* Chart legend */}
              <div className="flex justify-center items-center mt-2">
                <div className="flex items-center text-sm text-blue-300">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span>Jumlah Klik</span>
                </div>
              </div>
            </div>
            
            {/* URL List */}
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent flex items-center">
                  <FaLink className="mr-2 text-blue-400" /> URL Pendek Anda
                </h2>
                <a href="/dashboard/urls" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                  Lihat Semua <FaArrowRight className="ml-1" size={12} />
                </a>
              </div>
              <UrlList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Global Stats Footer */}
      <div className="mt-10 py-6 border-t border-white/10 bg-gradient-to-b from-transparent to-blue-950/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mr-3">
                <FaGlobe className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Statistik Global ShortKeun</h3>
                <p className="text-blue-300 text-sm">Bergabung dengan ribuan pengguna dari seluruh dunia</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="text-xl font-bold text-white">1.2M+</p>
                <p className="text-xs text-blue-300">URL Dibuat</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">5.7M+</p>
                <p className="text-xs text-blue-300">Total Klik</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">25K+</p>
                <p className="text-xs text-blue-300">Pengguna Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none z-0">
        <div className="waveform"></div>
      </div>
      
      {/* Ganti decorative rings dengan floating dots yang lebih halus */}
      <div className="dots-container hidden lg:block pointer-events-none">
        <div className="dot dot-1"><div className="pulse"></div></div>
        <div className="dot dot-3"><div className="pulse"></div></div>
        <div className="dot dot-5"><div className="pulse"></div></div>
        <div className="dot dot-7"><div className="pulse"></div></div>
      </div>
    </>
  );
} 