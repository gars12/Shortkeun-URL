// src/lib/shorturl.js
import { nanoid } from 'nanoid';
import supabase from './supabase'; // Pastikan path ini benar dan supabase client terinisialisasi

export async function createShortUrl({ originalUrl, customSlug = null, expiresAt = null, userId = null }) {
  try {
    console.log("[createShortUrl] Fungsi dipanggil dengan:", { originalUrl, customSlug, expiresAt, userId });
    let finalUserId = userId;
    if (!finalUserId) {
        finalUserId = 1; // Default user anonim
        console.log("[createShortUrl] userId tidak ada, menggunakan default:", finalUserId);
    }

    const shortCode = customSlug || nanoid(6);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortenedUrl = `${baseUrl}/${shortCode}`;
    console.log("[createShortUrl] URL pendek yang akan dibuat:", shortenedUrl);
    
    const nowISOString = new Date().toISOString();
    const insertData = {
      original_url: originalUrl,
      shortened_url: shortenedUrl,
      click_count: 0,
      expired_at: expiresAt, 
      created_at: nowISOString,
      updated_at: nowISOString,
      user_id: parseInt(finalUserId, 10) || 1 
    };
    
    console.log("[createShortUrl] Data yang akan diinsert ke short_urls:", JSON.stringify(insertData));
    const { data, error } = await supabase
      .from('short_urls')
      .insert([insertData])
      .select()
      .single(); 
    
    if (error) {
      console.error("[createShortUrl] Supabase insert error ke short_urls:", JSON.stringify(error, null, 2));
      throw error;
    }
    console.log("[createShortUrl] Berhasil insert ke short_urls, data:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("[createShortUrl] Catch error:", error.message, error.stack);
    throw error;
  }
}

export async function getShortUrlByCode(code) {
  try {
    console.log(`[getShortUrlByCode] Mencari URL untuk kode: ${code}`);
    if (!code || code.trim() === '') {
        console.warn(`[getShortUrlByCode] Kode tidak valid atau kosong: '${code}'`);
        return null;
    }
    
    const shortenedUrlPattern = `%/${code}`;
    console.log(`[getShortUrlByCode] Menggunakan pola LIKE: '${shortenedUrlPattern}'`);

    const { data, error } = await supabase
      .from('short_urls')
      .select('*')
      .like('shortened_url', shortenedUrlPattern)
      .is('deleted_at', null)
      .maybeSingle(); 

    if (error) {
      console.error(`[getShortUrlByCode] Error saat mengambil URL dengan kode '${code}':`, JSON.stringify(error, null, 2));
      return null;
    }
    
    if (data) {
        const urlParts = data.shortened_url.split('/');
        const foundCode = urlParts[urlParts.length - 1];
        if (foundCode === code) {
            console.log(`[getShortUrlByCode] URL ditemukan:`, JSON.stringify(data, null, 2));
            return data;
        } else {
            console.warn(`[getShortUrlByCode] URL ditemukan (${data.shortened_url}) tetapi kode tidak cocok (ekspektasi ${code}, dapat ${foundCode})`);
        }
    } else {
        console.warn(`[getShortUrlByCode] Tidak ada URL yang ditemukan untuk kode: ${code}`);
    }
    return null;
  } catch (error) {
    console.error(`[getShortUrlByCode] Error umum untuk kode '${code}':`, error.message, error.stack);
    return null;
  }
}

export async function incrementClickCount(id, ipAddress = null, userAgent = null) {
  let operationStatus = { rpcIncrement: false, manualIncrement: false, clickRecordInsert: false, errors: [] };
  try {
    console.log(`[incrementClickCount] Memulai untuk short_url_id: ${id}, IP: ${ipAddress}, UserAgent: ${userAgent}`);
    if (id === null || id === undefined) { // Periksa null atau undefined
      console.error('[incrementClickCount] ID short_url_id tidak valid (null atau undefined):', id);
      operationStatus.errors.push('ID short_url_id tidak valid (null atau undefined)');
      return operationStatus;
    }
    
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      console.error('[incrementClickCount] short_url_id bukan angka yang valid:', id);
      operationStatus.errors.push('short_url_id bukan angka yang valid');
      return operationStatus;
    }
    console.log(`[incrementClickCount] ID numerik yang akan digunakan: ${numericId}`);

    // 1. Increment click_count di tabel short_urls
    console.log(`[incrementClickCount] Mencoba RPC 'increment' untuk ID short_urls: ${numericId}`);
    const { error: rpcError } = await supabase.rpc('increment', { row_id: numericId, x: 1 });

    if (rpcError) {
        console.error(`[incrementClickCount] Gagal RPC 'increment' untuk ID ${numericId}. Error:`, JSON.stringify(rpcError, null, 2));
        operationStatus.errors.push(`RPC increment gagal: ${JSON.stringify(rpcError)}`);
        
        console.log(`[incrementClickCount] Mencoba update manual click_count untuk ID ${numericId}`);
        const { data: currentData, error: fetchError } = await supabase
            .from('short_urls')
            .select('click_count')
            .eq('id', numericId)
            .single();

        if (fetchError || !currentData) {
            console.error(`[incrementClickCount] Gagal mengambil click_count saat ini untuk ID ${numericId}. Error:`, JSON.stringify(fetchError, null, 2));
            operationStatus.errors.push(`Gagal fetch click_count: ${JSON.stringify(fetchError)}`);
        } else {
            const newClickCount = (currentData.click_count || 0) + 1;
            const { error: updateError } = await supabase
                .from('short_urls')
                .update({ click_count: newClickCount, updated_at: new Date().toISOString() })
                .eq('id', numericId);

            if (updateError) {
                console.error(`[incrementClickCount] Gagal update manual click_count untuk ID ${numericId}. Error:`, JSON.stringify(updateError, null, 2));
                operationStatus.errors.push(`Gagal update manual click_count: ${JSON.stringify(updateError)}`);
            } else {
                console.log(`[incrementClickCount] Berhasil update manual click_count untuk ID ${numericId} ke ${newClickCount}`);
                operationStatus.manualIncrement = true;
            }
        }
    } else {
        console.log(`[incrementClickCount] Berhasil RPC 'increment' untuk ID ${numericId}`);
        operationStatus.rpcIncrement = true;
    }

    // 2. Insert ke tabel clicks untuk mencatat riwayat klik
    const clickRecord = {
      short_url_id: numericId,
      created_at: new Date().toISOString(),
      ...(ipAddress && { ip_address: ipAddress }),
      ...(userAgent && { user_agent: userAgent }),
    };
    console.log(`[incrementClickCount] Data yang akan di-insert ke tabel 'clicks':`, JSON.stringify(clickRecord));

    const { data: clickInsertData, error: clickInsertError } = await supabase
      .from('clicks') 
      .insert(clickRecord)
      .select(); 

    if (clickInsertError) {
      console.error(`[incrementClickCount] GAGAL insert ke tabel 'clicks' untuk short_url_id ${numericId}. Error:`, JSON.stringify(clickInsertError, null, 2));
      operationStatus.errors.push(`Gagal insert ke clicks: ${JSON.stringify(clickInsertError)}`);
    } else {
      console.log(`[incrementClickCount] BERHASIL insert ke tabel 'clicks' untuk short_url_id ${numericId}. Data yang di-return:`, JSON.stringify(clickInsertData, null, 2));
      operationStatus.clickRecordInsert = true;
    }
    
    console.log('[incrementClickCount] Status operasi akhir:', operationStatus);
    return operationStatus; // Mengembalikan objek status
  } catch (error) {
    console.error('[incrementClickCount] Error Umum di luar dugaan:', error.message, error.stack);
    operationStatus.errors.push(`Error umum: ${error.message}`);
    return operationStatus;
  }
}

export async function getAllShortUrls(userId = null) {
  try {
    console.log(`[getAllShortUrls] Dipanggil untuk userId: ${userId || 'semua (jika admin)'}`);
    let query = supabase
      .from('short_urls')
      .select('*')
      .is('deleted_at', null);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("[getAllShortUrls] Error mengambil data short_urls:", JSON.stringify(error, null, 2));
      throw error;
    }
    console.log(`[getAllShortUrls] Berhasil mengambil ${data?.length || 0} short_urls.`);
    return data || [];
  } catch (error) {
    console.error("[getAllShortUrls] Catch error:", error.message, error.stack);
    throw error;
  }
}

export async function deleteShortUrl(id) {
  try {
    console.log(`[deleteShortUrl] Dipanggil untuk ID: ${id}`);
    const { error } = await supabase
      .from('short_urls')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error("[deleteShortUrl] Error saat menghapus URL:", JSON.stringify(error, null, 2));
      throw error;
    }
    console.log(`[deleteShortUrl] Berhasil soft delete URL ID: ${id}`);
    return true;
  } catch (error) {
    console.error("[deleteShortUrl] Catch error:", error.message, error.stack);
    throw error;
  }
}

export function isExpired(expiredAt) {
  if (!expiredAt) return false;
  return new Date() > new Date(expiredAt);
}
