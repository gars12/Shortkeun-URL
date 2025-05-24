// src/app/dashboard/urls/page.js
'use client';

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import Navbar from '@/components/Layout/Navbar'; // Pastikan path ini benar
import DeleteConfirmationModal from '@/components/Modal/DeleteConfirmationModal'; // Impor modal
import { 
  FaLink, 
  FaCopy, 
  FaTrash, 
  FaExternalLinkAlt, 
  FaChartBar, 
  FaClock, 
  FaCheck, 
  FaSearch,
  FaFilter,
  FaArrowLeft
} from 'react-icons/fa';
import Link from 'next/link';

export default function AllUrlsPage() { // Nama komponen diubah agar unik jika ada UrlList lain
  const [user, setUser] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('newest'); 

  // State untuk modal konfirmasi hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Format: { id: string, code: string }

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          setUser(null);
          return;
        }
        const userData = await response.json();
        if (userData && userData.user) {
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }
    fetchUserData();
  }, []);

  const fetchUrls = async () => {
    // setLoading(true) sudah dihandle di useEffect user
    setError('');
    try {
      const res = await fetch('/api/shorturl/all');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat mengambil data URL');
      }
      setUrls(data.data || []);
    } catch (err) {
      setError(err.message);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user !== undefined) { 
        fetchUrls();
    }
  }, [user]);


  const copyToClipboard = (urlToCopy, id) => {
    navigator.clipboard.writeText(urlToCopy).then(
      () => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      },
      () => {
        setError('Gagal menyalin URL');
      }
    );
  };

  const handleDeleteClick = (id, shortCode) => {
    setItemToDelete({ id, code: shortCode });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const res = await fetch(`/api/shorturl/delete/${itemToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat menghapus URL');
      }
      fetchUrls();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return formatDistance(new Date(dateString), new Date(), {
        addSuffix: true,
        locale: id
      });
    } catch (e) {
      return 'Tanggal tidak valid';
    }
  };

  const getShortCode = (shortenedUrl) => {
    if (!shortenedUrl) return '';
    try {
      const urlObject = new URL(shortenedUrl);
      return urlObject.pathname.substring(1);
    } catch (e) {
      const parts = shortenedUrl.split('/');
      return parts[parts.length - 1];
    }
  };

  const filteredAndSortedUrls = urls
    .filter(url => {
      const urlIsExpired = url.expiredAt ? new Date() > new Date(url.expiredAt) : false;
      if (filter === 'active' && urlIsExpired) return false;
      if (filter === 'expired' && !urlIsExpired) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const originalUrlLower = url.originalUrl?.toLowerCase() || '';
        const shortenedUrlLower = url.shortenedUrl?.toLowerCase() || '';
        return (
          originalUrlLower.includes(query) ||
          shortenedUrlLower.includes(query) 
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'most-clicks':
          return (b.clickCount || 0) - (a.clickCount || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  if (loading) {
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
            <p className="text-blue-200 text-sm">Memuat data...</p>
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-start mb-6">
            <Link href="/dashboard" className="flex items-center text-blue-400 hover:text-blue-300">
              <FaArrowLeft className="mr-2" /> 
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
          <div className="text-center mb-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
              Semua URL Pendek
            </h1>
            <p className="text-blue-300 max-w-lg mx-auto">
              Kelola semua tautan pendek Anda dalam satu tempat
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 md:max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-blue-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari URL..."
                  className="bg-blue-900/20 border border-blue-700/50 text-white pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-blue-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-blue-700/50 px-2 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-blue-900 text-white"
                  >
                    <option value="all" className="bg-blue-900 text-white">Semua URL</option>
                    <option value="active" className="bg-blue-900 text-white">URL Aktif</option>
                    <option value="expired" className="bg-blue-900 text-white">URL Expired</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-sm">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-blue-700/50 px-2 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-blue-900 text-white"
                  >
                    <option value="newest" className="bg-blue-900 text-white">Terbaru</option>
                    <option value="oldest" className="bg-blue-900 text-white">Terlama</option>
                    <option value="most-clicks" className="bg-blue-900 text-white">Terbanyak Diklik</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        {error && !isDeleteModalOpen && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          {filteredAndSortedUrls.length === 0 && !loading ? (
            <div className="text-center py-12 text-blue-300/70">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center mb-4">
                  <FaLink className="text-blue-300/70 text-2xl" />
                </div>
                <p className="text-lg">Tidak ada URL yang ditemukan</p>
                <p className="text-sm mt-2">
                  {searchQuery 
                    ? "Coba ubah kata kunci pencarian Anda" 
                    : filter !== 'all' 
                      ? `Tidak ada URL ${filter === 'active' ? 'aktif' : 'expired'}`
                      : "Belum ada URL pendek yang dibuat"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-800/30">
                <thead className="bg-blue-900/20">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">URL Asli</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">URL Pendek</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-blue-300 uppercase tracking-wider">Klik</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Dibuat</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Expired</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-blue-300 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-800/30">
                  {filteredAndSortedUrls.map((url) => {
                    const shortCode = getShortCode(url.shortenedUrl);
                    const isUrlExpired = url.expiredAt ? new Date() > new Date(url.expiredAt) : false;
                    return (
                    <tr key={url.id} className="hover:bg-blue-900/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="truncate max-w-xs text-sm text-blue-200" title={url.originalUrl}>
                          {url.originalUrl}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <a
                            href={url.shortenedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 truncate max-w-xs text-sm flex items-center group"
                            title={url.shortenedUrl}
                          >
                            <span>{url.shortenedUrl}</span> {/* Menampilkan URL lengkap di sini */}
                            <FaExternalLinkAlt className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(url.shortenedUrl, url.id)}
                            className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-800/30 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Salin URL"
                          >
                            {copied === url.id ? <FaCheck className="text-green-400" /> : <FaCopy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="bg-blue-900/40 px-3 py-1 rounded-full text-blue-300 text-sm inline-flex items-center">
                          <FaChartBar className="mr-1 text-xs" />
                          <span>{url.clickCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-blue-300">
                        {formatDate(url.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        {isUrlExpired ? (
                          <span className="inline-flex items-center text-red-400 text-sm">
                            <FaClock className="mr-1" />
                            Expired
                          </span>
                        ) : url.expiredAt ? (
                          <span className="text-blue-300 text-sm flex items-center">
                            <FaClock className="mr-1 text-xs" />
                            {formatDate(url.expiredAt)}
                          </span>
                        ) : (
                          <span className="text-blue-300/50 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteClick(url.id, shortCode)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors"
                          title="Hapus URL"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none z-0"><div className="waveform"></div></div>
      <div className="dots-container hidden lg:block pointer-events-none">
        <div className="dot dot-1"><div className="pulse"></div></div>
        <div className="dot dot-3"><div className="pulse"></div></div>
        <div className="dot dot-5"><div className="pulse"></div></div>
        <div className="dot dot-7"><div className="pulse"></div></div>
      </div>

      {itemToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
          itemName={itemToDelete.code}
        />
      )}
    </>
  );
}
