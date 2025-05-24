import { nanoid } from 'nanoid';
import supabase from './supabase';

export async function createShortUrl({ originalUrl, customSlug = null, expiresAt = null, userId = null }) {
  try {
    let finalUserId = userId;
    if (!finalUserId) {
        finalUserId = 1;
    }

    const shortCode = customSlug || nanoid(6);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortenedUrl = `${baseUrl}/${shortCode}`;
    
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
    
    const { data, error } = await supabase
      .from('short_urls')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase insert error in createShortUrl:", error.message);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in createShortUrl:", error.message);
    throw error;
  }
}

export async function getShortUrlByCode(code) {
  try {
    if (!code || code.trim() === '') {
        return null;
    }
    
    const shortenedUrlPattern = `%/${code}`;

    const { data, error } = await supabase
      .from('short_urls')
      .select('*')
      .like('shortened_url', shortenedUrlPattern)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching URL by code '${code}':`, error.message);
      return null;
    }
    
    if (data) {
        const urlParts = data.shortened_url.split('/');
        const foundCode = urlParts[urlParts.length - 1];
        if (foundCode === code) {
            return data;
        }
    }
    return null;
  } catch (error) {
    console.error(`General error in getShortUrlByCode for code '${code}':`, error.message);
    return null;
  }
}

export async function incrementClickCount(id, ipAddress = null, userAgent = null) {
  let operationStatus = { rpcIncrement: false, manualIncrement: false, clickRecordInsert: false, errors: [] };
  try {
    if (id === null || id === undefined) {
      operationStatus.errors.push('ID short_url_id tidak valid (null atau undefined)');
      return operationStatus;
    }
    
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      operationStatus.errors.push('short_url_id bukan angka yang valid');
      return operationStatus;
    }

    const { error: rpcError } = await supabase.rpc('increment', { row_id: numericId, x: 1 });

    if (rpcError) {
        operationStatus.errors.push(`RPC increment gagal: ${rpcError.message}`);
        const { data: currentData, error: fetchError } = await supabase
            .from('short_urls')
            .select('click_count')
            .eq('id', numericId)
            .single();

        if (fetchError || !currentData) {
            operationStatus.errors.push(`Gagal fetch click_count: ${fetchError?.message}`);
        } else {
            const newClickCount = (currentData.click_count || 0) + 1;
            const { error: updateError } = await supabase
                .from('short_urls')
                .update({ click_count: newClickCount, updated_at: new Date().toISOString() })
                .eq('id', numericId);

            if (updateError) {
                operationStatus.errors.push(`Gagal update manual click_count: ${updateError.message}`);
            } else {
                operationStatus.manualIncrement = true;
            }
        }
    } else {
        operationStatus.rpcIncrement = true;
    }

    const clickRecord = {
      short_url_id: numericId,
      created_at: new Date().toISOString(),
      ...(ipAddress && { ip_address: ipAddress }),
      ...(userAgent && { user_agent: userAgent }),
    };

    const { error: clickInsertError } = await supabase
      .from('clicks')
      .insert(clickRecord);

    if (clickInsertError) {
      console.error(`Failed to insert into 'clicks' table for short_url_id ${numericId}:`, clickInsertError.message);
      operationStatus.errors.push(`Gagal insert ke clicks: ${clickInsertError.message}`);
    } else {
      operationStatus.clickRecordInsert = true;
    }
    
    return operationStatus;
  } catch (error) {
    console.error('General error in incrementClickCount:', error.message);
    operationStatus.errors.push(`Error umum: ${error.message}`);
    return operationStatus;
  }
}

export async function getAllShortUrls(userId = null) {
  try {
    let query = supabase
      .from('short_urls')
      .select('*')
      .is('deleted_at', null);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error in getAllShortUrls:", error.message);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Catch error in getAllShortUrls:", error.message);
    throw error;
  }
}

export async function deleteShortUrl(id) {
  try {
    const { error } = await supabase
      .from('short_urls')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error("Error in deleteShortUrl:", error.message);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Catch error in deleteShortUrl:", error.message);
    throw error;
  }
}

export function isExpired(expiredAt) {
  if (!expiredAt) return false;
  return new Date() > new Date(expiredAt);
}
