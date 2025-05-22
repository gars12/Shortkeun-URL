'use client';

import { useState } from 'react';
import { createLocalShortUrl } from '../../lib/localStorageShortUrl';

export default function LocalCreateShortUrl({ onUrlCreated }) {
  const [formData, setFormData] = useState({
    originalUrl: '',
    customSlug: '',
    expiry: { value: '', unit: 'days' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validasi URL
      if (!formData.originalUrl) {
        throw new Error('URL harus diisi');
      }

      // Validasi URL format
      try {
        new URL(formData.originalUrl);
      } catch {
        throw new Error('Format URL tidak valid');
      }

      // Persiapkan data untuk membuat URL pendek
      const shorturlData = {
        originalUrl: formData.originalUrl,
        customSlug: formData.customSlug || undefined
      };

      // Set tanggal kedaluwarsa jika ada
      let expiresAt = null;
      if (formData.expiry.value) {
        // Calculate expiry date
        const value = Number(formData.expiry.value);
        const unit = formData.expiry.unit;
        
        const date = new Date();
        switch(unit) {
          case 'minutes':
            date.setMinutes(date.getMinutes() + value);
            break;
          case 'hours':
            date.setHours(date.getHours() + value);
            break;
          case 'days':
            date.setDate(date.getDate() + value);
            break;
          case 'weeks':
            date.setDate(date.getDate() + (value * 7));
            break;
          case 'months':
            date.setMonth(date.getMonth() + value);
            break;
        }
        expiresAt = date.toISOString();
        shorturlData.expiresAt = expiresAt;
      }

      // Buat URL pendek secara lokal
      const shortUrl = createLocalShortUrl(shorturlData);

      // Reset form
      setFormData({
        originalUrl: '',
        customSlug: '',
        expiry: { value: '', unit: 'days' }
      });

      // Set success message
      setSuccess(`URL pendek berhasil dibuat: ${shortUrl.shortened_url}`);

      // Panggil callback jika ada
      if (onUrlCreated) {
        onUrlCreated(shortUrl);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Buat URL Pendek (Mode Lokal)</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originalUrl">
            URL Asli
          </label>
          <input
            type="url"
            id="originalUrl"
            name="originalUrl"
            value={formData.originalUrl}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://example.com/halaman-dengan-url-panjang"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customSlug">
            Custom URL (opsional)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
              {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/
            </span>
            <input
              type="text"
              id="customSlug"
              name="customSlug"
              value={formData.customSlug}
              onChange={handleChange}
              className="rounded-none rounded-r-lg border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="custom-url"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Masa Berlaku (opsional)
          </label>
          <div className="flex">
            <input
              type="number"
              name="expiryValue"
              value={formData.expiry.value}
              onChange={handleChange}
              min="1"
              className="shadow appearance-none border rounded-l w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="30"
            />
            <select
              name="expiryUnit"
              value={formData.expiry.unit}
              onChange={handleChange}
              className="shadow border rounded-r w-2/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="minutes">Menit</option>
              <option value="hours">Jam</option>
              <option value="days">Hari</option>
              <option value="weeks">Minggu</option>
              <option value="months">Bulan</option>
            </select>
          </div>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p>
            <strong>Mode Lokal:</strong> URL pendek akan disimpan di browser lokal, bukan di database.
          </p>
          <p className="text-sm mt-1">
            Data akan hilang jika cache browser dibersihkan.
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Buat URL Pendek Lokal'}
        </button>
      </form>
    </div>
  );
} 