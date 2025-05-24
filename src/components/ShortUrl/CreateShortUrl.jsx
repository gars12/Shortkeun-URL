'use client';

import { useState } from 'react';
import { FaLink, FaCircleNotch, FaClock, FaFingerprint } from 'react-icons/fa';
import Toast from '../Notification/Toast';

export default function CreateShortUrl({ onUrlCreated, userId }) {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customSlug: '',
    expiry: { value: '', unit: 'days' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'expiryValue') {
      setFormData({
        ...formData,
        expiry: { ...formData.expiry, value }
      });
    } else if (name === 'expiryUnit') {
      setFormData({
        ...formData,
        expiry: { ...formData.expiry, unit: value }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const payload = {
      originalUrl: formData.originalUrl,
      customSlug: formData.customSlug || undefined,
      userId: userId || undefined
    };

    if (formData.expiry.value) {
      payload.expiry = {
        value: formData.expiry.value,
        unit: formData.expiry.unit
      };
    }

    try {
      const res = await fetch('/api/shorturl/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat membuat URL pendek');
      }

      setFormData({
        originalUrl: '',
        customSlug: '',
        expiry: { value: '', unit: 'days' }
      });

      showToast(`URL pendek berhasil dibuat: ${data.shortUrl.shortenedUrl}`, 'success');

      if (onUrlCreated) {
        onUrlCreated(data.shortUrl);
      }
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={handleCloseToast}
        duration={1000}
      />
      
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6 shadow-2xl">
        <h2 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-100 bg-clip-text text-transparent flex items-center">
          <FaLink className="mr-2 text-blue-400" /> Buat URL Pendek
        </h2>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 text-sm md:text-base rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-300 text-xs md:text-sm font-medium mb-1" htmlFor="originalUrl">
              URL Asli
            </label>
            <div className="relative">
              <input
                type="url"
                id="originalUrl"
                name="originalUrl"
                value={formData.originalUrl}
                onChange={handleChange}
                className="bg-blue-900/20 border border-blue-700/50 text-white w-full py-2 px-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/halaman-dengan-url-panjang"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-300 text-xs md:text-sm font-medium mb-1" htmlFor="customSlug">
              <div className="flex items-center">
                <FaFingerprint className="mr-1 text-blue-400 text-xs md:text-sm" />
                <span>URL Kustom (opsional)</span>
              </div>
            </label>
            <div className="flex rounded-lg overflow-hidden">
              <span className="inline-flex items-center px-2 text-xs text-blue-300 bg-blue-900/40 border border-r-0 border-blue-700/50">
                {process.env.NEXT_PUBLIC_APP_URL}/
              </span>
              <input
                type="text"
                id="customSlug"
                name="customSlug"
                value={formData.customSlug}
                onChange={handleChange}
                className="bg-blue-900/20 border border-blue-700/50 text-white flex-1 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="custom-url"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-300 text-xs md:text-sm font-medium mb-1">
              <div className="flex items-center">
                <FaClock className="mr-1 text-blue-400 text-xs md:text-sm" />
                <span>Masa Berlaku (opsional)</span>
              </div>
            </label>
            <div className="flex rounded-lg overflow-hidden">
              <input
                type="number"
                name="expiryValue"
                value={formData.expiry.value}
                onChange={handleChange}
                min="1"
                className="bg-blue-900/20 border border-blue-700/50 text-white rounded-l-lg w-1/3 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="30"
              />
              <select
                name="expiryUnit"
                value={formData.expiry.unit}
                onChange={handleChange}
                className="border border-l-0 border-blue-700/50 rounded-r-lg w-2/3 py-2 px-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-blue-900 text-white"
              >
                <option 
                  value="minutes" 
                  className="bg-blue-900 text-white"
                >
                  Menit
                </option>
                <option 
                  value="hours" 
                  className="bg-blue-900 text-white"
                >
                  Jam
                </option>
                <option 
                  value="days" 
                  className="bg-blue-900 text-white"
                >
                  Hari
                </option>
                <option 
                  value="weeks" 
                  className="bg-blue-900 text-white"
                >
                  Minggu
                </option>
                <option 
                  value="months" 
                  className="bg-blue-900 text-white"
                >
                  Bulan
                </option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 text-sm md:text-base rounded-lg focus:outline-none transition-all flex items-center justify-center space-x-2"
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
                  <svg className="w-4 h-4 absolute top-0.5 left-0.5 animate-spin-reverse" viewBox="0 0 24 24">
                    <path 
                      className="opacity-90" 
                      fill="none"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M12 6a6 6 0 0 0 -6 6"
                    />
                  </svg>
                </div>
                <span>Sedang Membuat...</span>
              </>
            ) : (
              <>
                <span className="mr-2">Buat URL Pendek</span>
                <FaLink className="text-sm" />
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
} 