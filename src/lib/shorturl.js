import { nanoid } from 'nanoid';
import supabase from './supabase';
import { getUserFromSession } from './auth';

// Membuat URL pendek baru
export async function createShortUrl({ originalUrl, customSlug = null, expiresAt = null, userId = null }) {
  try {
    console.log("Creating short URL with params:", { originalUrl, customSlug, expiresAt, userId });
    
    // Ambil user dari session jika tidak ada userId yang diberikan
    let finalUserId = userId;
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
      const sessionUser = await getUserFromSession();
      if (sessionUser) {
        finalUserId = sessionUser.id;
        console.log("Using user ID from session:", finalUserId);
      }
    }
    
    // Generate kode pendek unik atau gunakan customSlug jika ada
    const shortCode = customSlug || nanoid(6);
    console.log("Short code generated:", shortCode);
    
    // Buat shortened_url dari kode pendek
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortenedUrl = `${baseUrl}/${shortCode}`;
    console.log("Shortened URL:", shortenedUrl);
    
    // Data untuk insert
    const insertData = {
      original_url: originalUrl,
      shortened_url: shortenedUrl,
      click_count: 0,
      expired_at: expiresAt,
      created_at: new Date(),
      updated_at: new Date()
      // Tidak menambahkan user_id jika tidak ada user yang login
    };
    
    // Tambahkan user_id jika ada user yang login
    if (finalUserId && finalUserId !== '00000000-0000-0000-0000-000000000000') {
      // Konversi ke integer jika perlu
      insertData.user_id = typeof finalUserId === 'number' ? finalUserId : parseInt(finalUserId, 10) || null;
    }
    
    console.log("Insert data:", insertData);
    
    // Test koneksi Supabase
    console.log("Testing Supabase connection...");
    const { data: testData, error: testError } = await supabase
      .from('short_urls')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      console.error("Supabase connection test failed:", testError);
      throw new Error(`Supabase connection issue: ${testError.message}`);
    }
    console.log("Supabase connection test successful:", testData);
    
    // Insert ke database
    console.log("Inserting into database...");
    const { data, error } = await supabase
      .from('short_urls')
      .insert([insertData])
      .select();
    
    if (error) {
      console.error("Insert error:", error);
      throw error;
    }
    
    console.log("Short URL created successfully:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Error in createShortUrl:", error);
    if (error.code) console.error("Error code:", error.code);
    if (error.details) console.error("Error details:", error.details);
    if (error.hint) console.error("Error hint:", error.hint);
    throw error;
  }
}

// Ambil URL pendek berdasarkan kode
export async function getShortUrlByCode(code) {
  try {
    console.log(`[getShortUrlByCode] Looking for URL with code: ${code}`);
    if (!code) {
      console.error('[getShortUrlByCode] No code provided');
      return null;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortenedUrl = `${baseUrl}/${code}`;
    console.log(`[getShortUrlByCode] Searching for shortened URL: ${shortenedUrl}`);
    
    // Metode 1: Coba cari berdasarkan shortened_url yang lengkap
    const { data: exactMatchData, error: exactMatchError } = await supabase
      .from('short_urls')
      .select('*')
      .eq('shortened_url', shortenedUrl)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (!exactMatchError && exactMatchData) {
      console.log(`[getShortUrlByCode] Found by exact match: ${exactMatchData.shortened_url}`);
      return exactMatchData;
    }
    
    console.log(`[getShortUrlByCode] Not found by exact match, error:`, exactMatchError);
    
    // Metode 2: Coba cari dengan LIKE pattern
    console.log(`[getShortUrlByCode] Trying with LIKE pattern for code: ${code}`);
    const { data: likePatternData, error: likePatternError } = await supabase
      .from('short_urls')
      .select('*')
      .like('shortened_url', `%/${code}`)
      .is('deleted_at', null)
      .maybeSingle();
      
    if (!likePatternError && likePatternData) {
      console.log(`[getShortUrlByCode] Found by LIKE pattern: ${likePatternData.shortened_url}`);
      return likePatternData;
    }
    
    console.log(`[getShortUrlByCode] Not found by LIKE pattern, error:`, likePatternError);
    
    // Metode 3: Ambil semua URL dan cari dengan JavaScript
    console.log(`[getShortUrlByCode] Trying direct search in all URLs for code: ${code}`);
    const { data: allUrlsData, error: allUrlsError } = await supabase
      .from('short_urls')
      .select('*')
      .is('deleted_at', null);
      
    if (allUrlsError) {
      console.error(`[getShortUrlByCode] Error fetching all URLs:`, allUrlsError);
    } else {
      // Cari URL yang mengandung kode di shortened_url
      const matchedUrl = allUrlsData.find(url => 
        url.shortened_url.includes(`/${code}`) || 
        url.shortened_url.endsWith(code)
      );
      
      if (matchedUrl) {
        console.log(`[getShortUrlByCode] Found by JS search: ${matchedUrl.shortened_url}`);
        return matchedUrl;
      }
      
      console.log(`[getShortUrlByCode] Not found in ${allUrlsData.length} URLs checked by JS`);
    }
    
    console.error(`[getShortUrlByCode] URL not found for code: ${code} after trying all methods`);
    return null;
  } catch (error) {
    console.error(`[getShortUrlByCode] Error:`, error);
    return null;
  }
}

// Increment jumlah klik
export async function incrementClickCount(id) {
  try {
    console.log(`[incrementClickCount] Starting increment for ID: ${id}`);
    
    if (!id) {
      console.error('[incrementClickCount] Invalid ID provided:', id);
      throw new Error('ID is required to increment click count');
    }
    
    // Konversi ID ke angka jika string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(numericId)) {
      console.error('[incrementClickCount] ID is not a valid number:', id);
      throw new Error('ID must be a valid number');
    }
    
    console.log(`[incrementClickCount] Using numeric ID: ${numericId}`);
    
    // Log struktur tabel untuk debugging
    console.log(`[incrementClickCount] Checking table structure...`);
    const { data: tableInfo, error: tableError } = await supabase
      .from('short_urls')
      .select('id, click_count')
      .limit(1);
      
    if (tableError) {
      console.error(`[incrementClickCount] Table structure check failed:`, tableError);
    } else {
      console.log(`[incrementClickCount] Table structure sample:`, tableInfo);
    }
    
    // Ambil data saat ini dengan error handling yang lebih baik
    console.log(`[incrementClickCount] Fetching current data for ID: ${numericId}`);
    const { data: currentData, error: fetchError } = await supabase
      .from('short_urls')
      .select('click_count, id')
      .eq('id', numericId)
      .maybeSingle();
      
    if (fetchError) {
      console.error(`[incrementClickCount] Error fetching current data:`, fetchError);
      
      // Coba cara alternatif jika ID mungkin bukan numerik
      console.log(`[incrementClickCount] Trying alternative fetch with string ID: ${id}`);
      const { data: altData, error: altError } = await supabase
        .from('short_urls')
        .select('click_count, id')
        .eq('id', id.toString())
        .maybeSingle();
        
      if (altError) {
        console.error(`[incrementClickCount] Alternative fetch also failed:`, altError);
        throw new Error(`Failed to fetch current click count: ${fetchError.message}`);
      }
      
      if (!altData) {
        console.error(`[incrementClickCount] No data found with ID: ${id}`);
        throw new Error(`No record found with ID: ${id}`);
      }
      
      console.log(`[incrementClickCount] Found data with alternative fetch:`, altData);
      return incrementAndUpdate(altData);
    }
    
    if (!currentData) {
      console.error(`[incrementClickCount] No data found with ID: ${numericId}`);
      throw new Error(`No record found with ID: ${numericId}`);
    }
    
    console.log(`[incrementClickCount] Current data:`, currentData);
    return incrementAndUpdate(currentData);
    
    // Helper function to increment and update
    async function incrementAndUpdate(data) {
      // Increment click count secara manual
      const newClickCount = ((data?.click_count || 0) + 1);
      console.log(`[incrementClickCount] New click count will be: ${newClickCount}`);
      
      // Update record
      console.log(`[incrementClickCount] Updating record for ID: ${data.id}`);
      const { data: updatedData, error: updateError } = await supabase
        .from('short_urls')
        .update({
          click_count: newClickCount,
          updated_at: new Date()
        })
        .eq('id', data.id)
        .select();
      
      if (updateError) {
        console.error(`[incrementClickCount] Error updating record:`, updateError);
        throw new Error(`Failed to update click count: ${updateError.message}`);
      }
      
      if (!updatedData || updatedData.length === 0) {
        console.error(`[incrementClickCount] Update returned no data`);
        throw new Error('Update completed but no data returned');
      }
      
      console.log(`[incrementClickCount] Update successful. New data:`, updatedData[0]);
      return updatedData[0];
    }
  } catch (error) {
    console.error('[incrementClickCount] Error incrementing click count:', error);
    if (error.code) console.error('[incrementClickCount] Error code:', error.code);
    if (error.details) console.error('[incrementClickCount] Error details:', error.details);
    if (error.hint) console.error('[incrementClickCount] Error hint:', error.hint);
    throw error;
  }
}

// Ambil semua URL pendek
export async function getAllShortUrls(userId = null) {
  let query = supabase
    .from('short_urls')
    .select('*')
    .is('deleted_at', null);
  
  // Filter berdasarkan user_id jika ada
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data;
}

// Hapus URL pendek (soft delete)
export async function deleteShortUrl(id) {
  const { error } = await supabase
    .from('short_urls')
    .update({
      deleted_at: new Date(),
      updated_at: new Date()
    })
    .eq('id', id);
  
  if (error) throw error;
  
  return true;
}

// Cek apakah URL sudah expired
export function isExpired(expiredAt) {
  if (!expiredAt) return false;
  return new Date() > new Date(expiredAt);
} 