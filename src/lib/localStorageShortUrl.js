import { nanoid } from 'nanoid';

const getStoredUrls = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedUrls = localStorage.getItem('shortUrls');
    return storedUrls ? JSON.parse(storedUrls) : [];
  } catch (e) {
    // Di production, console.error mungkin ingin di-log ke sistem monitoring
    // console.error('Error reading from localStorage:', e); 
    return [];
  }
};

const storeUrls = (urls) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('shortUrls', JSON.stringify(urls));
  } catch (e) {
    // console.error('Error writing to localStorage:', e);
  }
};

export const createLocalShortUrl = ({ originalUrl, customSlug = null, expiresAt = null }) => {
  const shortCode = customSlug || nanoid(6);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shortenedUrl = `${baseUrl}/${shortCode}`;
  
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
  
  const shortUrls = getStoredUrls();
  shortUrls.unshift(newShortUrl);
  storeUrls(shortUrls);
  
  return newShortUrl;
};

export const getLocalShortUrlByCode = (code) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shortenedUrl = `${baseUrl}/${code}`;
  
  const shortUrls = getStoredUrls();
  return shortUrls.find(url => 
    url.shortened_url === shortenedUrl && 
    url.deleted_at === null
  ) || null;
};

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

export const getAllLocalShortUrls = () => {
  return getStoredUrls().filter(url => url.deleted_at === null);
};

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

export const isLocalExpired = (expiredAt) => {
  if (!expiredAt) return false;
  return new Date() > new Date(expiredAt);
};
