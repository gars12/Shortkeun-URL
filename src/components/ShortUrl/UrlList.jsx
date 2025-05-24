'use client';

import { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import { FaCopy, FaTrash, FaExternalLinkAlt, FaChartBar, FaClock, FaCheck } from 'react-icons/fa';
import DeleteConfirmationModal from '../Modal/DeleteConfirmationModal'; // Pastikan path ini benar

export default function UrlList({ refreshTrigger }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Format: { id: string, code: string }

  const fetchUrls = async () => {
    setLoading(true);
    setError(''); 
    try {
      const res = await fetch('/api/shorturl/all');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat mengambil data');
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
    fetchUrls();
  }, [refreshTrigger]);

  const copyToClipboard = (textToCopy, id) => { 
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      },
      () => {
        setError('Gagal menyalin'); 
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col items-center">
          <div className="relative w-10 h-10 mb-3">
            <svg className="w-10 h-10 absolute top-0 left-0 animate-spin-slow" viewBox="0 0 24 24"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="#60a5fa" strokeWidth="1" fill="none" strokeDasharray="40" strokeDashoffset="10"/></svg>
            <svg className="w-8 h-8 absolute top-1 left-1 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeOpacity="0.2"/><path className="opacity-75" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" d="M12 4a8 8 0 0 1 8 8"/></svg>
            <svg className="w-6 h-6 absolute top-2 left-2 animate-spin-reverse" viewBox="0 0 24 24"><path className="opacity-90" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" d="M12 6a6 6 0 0 0 -6 6"/></svg>
          </div>
          <p className="text-blue-300 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error && !isDeleteModalOpen) { 
    return (
      <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  if (urls.length === 0 && !loading) { 
    return (
      <div className="text-center py-12 text-blue-300/70">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center mb-4">
            <FaChartBar className="text-blue-300/70 text-2xl" />
          </div>
          <p className="text-lg">Belum ada URL pendek yang dibuat</p>
          <p className="text-sm mt-2">URL pendek yang Anda buat akan tampil di sini</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-800/30">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">URL Asli</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Kode Pendek</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-blue-300 uppercase tracking-wider">Klik</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Dibuat</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Expired</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-blue-300 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-800/30">
            {urls.map((url) => {
              const shortCode = getShortCode(url.shortenedUrl);
              const isUrlExpired = url.isExpired !== undefined ? url.isExpired : (url.expiredAt ? new Date() > new Date(url.expiredAt) : false);
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
                        <span>{shortCode}</span> 
                        <FaExternalLinkAlt className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(url.shortenedUrl, url.id)} 
                        className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-800/30 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Salin URL Pendek Lengkap"
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
              );
            })}
          </tbody>
        </table>
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
