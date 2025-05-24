'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Layout/Navbar';
import CreateShortUrl from '../../components/ShortUrl/CreateShortUrl';
import UrlList from '../../components/ShortUrl/UrlList';
import { FaChartLine, FaLink, FaClock, FaGlobe, FaChartBar, FaRocket, FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, isSameDay, addDays, isValid as isValidDate } from 'date-fns';
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

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          setUser(null);
          setUserId(null);
          setLoading(false);
          return;
        }
        const userData = await response.json();
        if (userData && userData.user) {
          setUser(userData.user);
          setUserId(userData.user.id);
        } else {
          setUser(null);
          setUserId(null);
          setLoading(false);
        }
      } catch (error) {
        // console.error('[Dashboard] Error fetching user data:', error); // Hapus di prod
        setUser(null);
        setUserId(null);
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    async function fetchStatisticsAndClicks() {
      if (!userId) { 
          setStatistics({ totalUrls: 0, totalClicks: 0, activeUrls: 0 });
          setClickData([]);
          setLoading(false); 
          return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/shorturl/all');
        if (!response.ok) {
          // console.error('[Dashboard] Gagal mengambil data URL:', response.status); // Hapus di prod
          setStatistics({ totalUrls: 0, totalClicks: 0, activeUrls: 0 });
          setClickData([]);
          return;
        }
        
        const data = await response.json();
        if (data && data.data) {
          const urls = data.data;
          const totalClicks = urls.reduce((acc, url) => acc + (url.clickCount || 0), 0);
          const activeUrls = urls.filter(url => !url.isExpired).length;
          
          setStatistics({ totalUrls: urls.length, totalClicks, activeUrls });

          const aggregatedClickHistory = [];
          urls.forEach(url => {
            const historySource = url.clickHistory || url.clicks;
            if (historySource && Array.isArray(historySource) && historySource.length > 0) {
              aggregatedClickHistory.push(...historySource);
            }
          });
          setClickData(aggregatedClickHistory);
        } else {
          setStatistics({ totalUrls: 0, totalClicks: 0, activeUrls: 0 });
          setClickData([]);
        }
      } catch (error) {
        // console.error('[Dashboard] Error saat mengambil statistik & klik:', error); // Hapus di prod
        setStatistics({ totalUrls: 0, totalClicks: 0, activeUrls: 0 });
        setClickData([]);
      } finally {
        setLoading(false); 
      }
    }
    
    if (userId) {
      fetchStatisticsAndClicks();
    } else if (user === null && loading) { 
      setLoading(false);
    }

  }, [userId, refreshTrigger, user, loading]); // Tambahkan user dan loading sbg dependensi untuk initial load

  useEffect(() => {
    function processClickDataForChart() {
      if (!clickData || clickData.length === 0) {
        setProcessedData([]);
        setLabels([]);
        return;
      }
      
      let startDate;
      let endDate = new Date(); 
      let dateFormat = 'EEE'; 
      
      switch(timeRange) {
        case 'week':
          startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); 
          endDate = addDays(startDate, 6); 
          dateFormat = 'EEE'; 
          break;
        case 'month':
          startDate = startOfMonth(new Date());
          dateFormat = 'd'; 
          break;
        case 'year':
          startDate = startOfYear(new Date());
          dateFormat = 'MMM'; 
          break;
        default:
          startDate = subDays(new Date(), 6); 
          dateFormat = 'EEE';
      }
      
      const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
      const newLabels = datesInRange.map(date => format(date, dateFormat, { locale: id }));
      
      const clickCounts = datesInRange.map(rangeDate => {
        let countForThisDate = 0;
        clickData.forEach(click => {
          if (!click || !click.timestamp) return;
          try {
            const clickDate = new Date(click.timestamp);
            if (isValidDate(clickDate) && isSameDay(clickDate, rangeDate)) {
              countForThisDate++;
            }
          } catch (err) {
            // console.error('[Dashboard processClickDataForChart] Error memproses timestamp klik:', err, click); // Hapus di prod
          }
        });
        return countForThisDate;
      });
      
      setProcessedData(clickCounts);
      setLabels(newLabels);
    }
    
    processClickDataForChart();
  }, [clickData, timeRange]);
  
  const handleUrlCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const chartDataConfig = {
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
        pointRadius: (processedData.length > 0 && processedData.some(d => d > 0)) ? 4 : 0,
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
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(148, 163, 184, 0.8)', font: { size: 10 }, stepSize: 1, precision: 0 }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(148, 163, 184, 0.8)', font: { size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)', titleColor: '#fff', bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)', borderWidth: 1, displayColors: false,
        callbacks: {
          title: (tooltipItems) => `${tooltipItems[0].label}`,
          label: (context) => `${context.raw} klik`
        }
      }
    }
  };

  const mainContentLoading = loading && userId === null && user === null;

  if (mainContentLoading) {
    return (
      <>
        <Navbar user={user} />
        <div className="fixed inset-0 flex items-center justify-center bg-blue-950/50 backdrop-blur-sm z-50">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 flex flex-col items-center">
            <div className="relative w-12 h-12 mb-3">
              <svg className="w-12 h-12 absolute top-0 left-0 animate-spin-slow" viewBox="0 0 24 24"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="#60a5fa" strokeWidth="1" fill="none" strokeDasharray="40" strokeDashoffset="10"/></svg>
              <svg className="w-10 h-10 absolute top-1 left-1 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeOpacity="0.2"/><path className="opacity-75" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" d="M12 4a8 8 0 0 1 8 8"/></svg>
              <svg className="w-8 h-8 absolute top-2 left-2 animate-spin-reverse" viewBox="0 0 24 24"><path className="opacity-90" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" d="M12 6a6 6 0 0 0 -6 6"/></svg>
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
      <div className="fixed top-20 right-10 w-16 h-16 rounded-full bg-blue-500/10 backdrop-blur-xl animate-float hidden md:block"></div>
      <div className="fixed bottom-20 left-10 w-10 h-10 rounded-full bg-purple-500/10 backdrop-blur-xl animate-float-slow hidden md:block"></div>
      <div className="fixed top-1/3 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-xl rotate-45 animate-pulse-slow hidden lg:block"></div>
      <div className="container mx-auto px-4 py-8">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center dashboard-card">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4"><FaLink className="text-blue-400" /></div>
                  <div><p className="text-blue-300 text-sm">Total URL</p><p className="text-2xl font-bold text-white">{statistics.totalUrls}</p></div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center dashboard-card">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4"><FaChartLine className="text-green-400" /></div>
                  <div><p className="text-blue-300 text-sm">Total Klik</p><p className="text-2xl font-bold text-white">{statistics.totalClicks}</p></div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center dashboard-card">
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4"><FaClock className="text-purple-400" /></div>
                  <div><p className="text-blue-300 text-sm">URL Aktif</p><p className="text-2xl font-bold text-white">{statistics.activeUrls}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CreateShortUrl onUrlCreated={handleUrlCreated} userId={userId} />
            <div className="bg-gradient-to-br from-blue-800/20 to-purple-800/20 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-2"><FaRocket className="text-blue-400" /></div>
                <h3 className="text-lg font-bold text-white">Tips Pemendek URL</h3>
              </div>
              <ul className="text-blue-300 text-sm space-y-2">
                <li className="flex items-start"><div className="h-5 w-5 rounded-full bg-blue-900/60 flex items-center justify-center mr-2 mt-0.5"><span className="text-blue-300 text-xs">1</span></div><span>Gunakan URL kustom yang mudah diingat untuk branding</span></li>
                <li className="flex items-start"><div className="h-5 w-5 rounded-full bg-blue-900/60 flex items-center justify-center mr-2 mt-0.5"><span className="text-blue-300 text-xs">2</span></div><span>Atur masa berlaku URL untuk konten sementara</span></li>
                <li className="flex items-start"><div className="h-5 w-5 rounded-full bg-blue-900/60 flex items-center justify-center mr-2 mt-0.5"><span className="text-blue-300 text-xs">3</span></div><span>Pantau klik untuk mengukur efektivitas tautan</span></li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
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
                    <option value="week" className="bg-blue-900 text-white">Minggu Ini</option>
                    <option value="month" className="bg-blue-900 text-white">Bulan Ini</option>
                    <option value="year" className="bg-blue-900 text-white">Tahun Ini</option>
                  </select>
                  <div className="tooltip-info relative group"> 
                    <FaInfoCircle className="text-blue-400 cursor-help" />
                    <div className="tooltip-text absolute hidden group-hover:block bg-slate-800 text-white text-xs p-2 rounded-md shadow-lg right-0 mt-1 w-48 z-10 border border-slate-700">
                      Grafik ini menampilkan jumlah klik harian berdasarkan rentang waktu yang dipilih.
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-64 w-full relative mb-2">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-blue-900/0 rounded-lg"></div>
                {(labels && labels.length > 0 && processedData && processedData.length > 0 && processedData.some(d => d > 0)) ? ( 
                  <Line data={chartDataConfig} options={chartOptions} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-blue-300/70 text-sm">
                      {loading ? "Memuat data chart..." : "Belum ada riwayat klik untuk ditampilkan pada rentang ini."}
                    </p>
                  </div>
                )}
              </div>
              {(labels && labels.length > 0 && processedData && processedData.length > 0 && processedData.some(d => d > 0)) && ( 
                <div className="flex justify-center items-center mt-2">
                  <div className="flex items-center text-sm text-blue-300">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span>Jumlah Klik</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent flex items-center">
                  <FaLink className="mr-2 text-blue-400" /> URL Pendek Anda
                </h2>
                <Link href="/dashboard/urls" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                  Lihat Semua <FaArrowRight className="ml-1" size={12} />
                </Link>
              </div>
              <UrlList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 py-6 border-t border-white/10 bg-gradient-to-b from-transparent to-blue-950/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mr-3"><FaGlobe className="text-blue-400" /></div>
              <div><h3 className="text-white font-semibold">Statistik Global ShortKeun</h3><p className="text-blue-300 text-sm">Bergabung dengan ribuan pengguna dari seluruh dunia</p></div>
            </div>
            <div className="flex space-x-6">
              <div className="text-center"><p className="text-xl font-bold text-white">1.2M+</p><p className="text-xs text-blue-300">URL Dibuat</p></div>
              <div className="text-center"><p className="text-xl font-bold text-white">5.7M+</p><p className="text-xs text-blue-300">Total Klik</p></div>
              <div className="text-center"><p className="text-xl font-bold text-white">25K+</p><p className="text-xs text-blue-300">Pengguna Aktif</p></div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none z-0"><div className="waveform"></div></div>
      <div className="dots-container hidden lg:block pointer-events-none">
        <div className="dot dot-1"><div className="pulse"></div></div><div className="dot dot-3"><div className="pulse"></div></div>
        <div className="dot dot-5"><div className="pulse"></div></div><div className="dot dot-7"><div className="pulse"></div></div>
      </div>
    </>
  );
}
