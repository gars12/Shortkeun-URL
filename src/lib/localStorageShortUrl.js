import { nanoid } from 'nanoid';

// Fungsi untuk mendapatkan semua URL pendek dari localStorage
const getStoredUrls = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedUrls = localStorage.getItem('shortUrls');
    return storedUrls ? JSON.parse(storedUrls) : [];
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return [];
  }
};

// Fungsi untuk menyimpan URL pendek ke localStorage
const storeUrls = (urls) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('shortUrls', JSON.stringify(urls));
  } catch (e) {
    console.error('Error writing to localStorage:', e);
  }
};

// Membuat URL pendek baru (alternatif jika Supabase tidak berfungsi)
export const createLocalShortUrl = ({ originalUrl, customSlug = null, expiresAt = null }) => {
  // Generate kode pendek unik atau gunakan customSlug jika ada
  const shortCode = customSlug || nanoid(6);
  
  // Buat URL pendek
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shortenedUrl = `${baseUrl}/${shortCode}`;
  
  // Data URL pendek baru
  const newShortUrl = {
    id: Date.now(),
    original_url: originalUrl,
    shortened_url: shortenedUrl,
    click_count: 0,
    expired_at: expiresAt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  };
  
  // Ambil URL pendek yang sudah ada dan tambahkan yang baru
  const shortUrls = getStoredUrls();
  shortUrls.unshift(newShortUrl);
  
  // Simpan kembali ke localStorage
  storeUrls(shortUrls);
  
  return newShortUrl;
};

// Ambil URL pendek berdasarkan kode
export const getLocalShortUrlByCode = (code) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shortenedUrl = `${baseUrl}/${code}`;
  
  const shortUrls = getStoredUrls();
  return shortUrls.find(url => 
    url.shortened_url === shortenedUrl && 
    url.deleted_at === null
  ) || null;
};

// Increment jumlah klik
export const incrementLocalClickCount = (id) => {
  const shortUrls = getStoredUrls();
  const updatedUrls = shortUrls.map(url => {
    if (url.id === id) {
      return {
        ...url,
        click_count: url.click_count + 1,
        updated_at: new Date().toISOString()
      };
    }
    return url;
  });
  
  storeUrls(updatedUrls);
  return updatedUrls.find(url => url.id === id);
};

// Ambil semua URL pendek
export const getAllLocalShortUrls = () => {
  return getStoredUrls().filter(url => url.deleted_at === null);
};

// Hapus URL pendek (soft delete)
export const deleteLocalShortUrl = (id) => {
  const shortUrls = getStoredUrls();
  const updatedUrls = shortUrls.map(url => {
    if (url.id === id) {
      return {
        ...url,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    return url;
  });
  
  storeUrls(updatedUrls);
  return true;
};

// Cek apakah URL sudah expired
export const isLocalExpired = (expiredAt) => {
  if (!expiredAt) return false;
  return new Date() > new Date(expiredAt);
}; 