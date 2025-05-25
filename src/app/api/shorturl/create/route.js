// src/app/api/shorturl/create/route.js
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getUserFromSession } from '../../../../lib/auth';
import supabase from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { originalUrl, customSlug, expiry, userId: providedUserId } = await request.json();

    if (!originalUrl) {
      return NextResponse.json(
        { success: false, message: 'URL wajib diisi' },
        { status: 400 }
      );
    }
    
    let cleanOriginalUrl = originalUrl;
    if (originalUrl && !originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
        cleanOriginalUrl = 'https://' + originalUrl;
    }

    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    if (!urlPattern.test(cleanOriginalUrl)) {
      return NextResponse.json(
        { success: false, message: 'Format URL tidak valid. Pastikan menyertakan http:// atau https://.' },
        { status: 400 }
      );
    }
    
    let finalUserId = providedUserId;
    if (!finalUserId) {
      const user = await getUserFromSession();
      if (user && user.id) {
        finalUserId = user.id;
      } else {
        finalUserId = 1; // User anonim default
      }
    } else {
      finalUserId = parseInt(providedUserId, 10);
      if (isNaN(finalUserId)) finalUserId = 1;
    }
    
    let shortCode = customSlug ? customSlug.trim() : '';

    if (shortCode) {
        const slugRegex = /^[a-zA-Z0-9-]{3,20}$/;
        if (!slugRegex.test(shortCode)) {
            return NextResponse.json(
                { success: false, message: 'Format custom URL tidak valid. Gunakan 3-20 karakter alfanumerik atau tanda hubung.' },
                { status: 400 }
            );
        }
        
        const { data: existingSlug, error: slugCheckError } = await supabase
            .from('short_urls')
            .select('id')
            .like('shortened_url', `%/${shortCode}`)
            .is('deleted_at', null)
            .maybeSingle();

        if (slugCheckError) {
            console.error("API Create - Error checking existing slug:", slugCheckError.message);
            // Jangan throw error ini ke catch utama jika ingin pesan spesifik
            return NextResponse.json(
                { success: false, message: 'Terjadi kesalahan saat memeriksa ketersediaan custom URL.' },
                { status: 500 }
            );
        }
        if (existingSlug) {
            return NextResponse.json(
                { success: false, message: 'Custom URL ini sudah digunakan. Silakan pilih yang lain.' },
                { status: 409 } // Ini adalah respons yang Anda inginkan
            );
        }
    } else {
      shortCode = nanoid(6);
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortenedUrl = `${baseUrl}/${shortCode}`;
    
    let expiresAtISO = null;
    if (expiry && expiry.value && expiry.unit) {
      const now = new Date();
      const value = parseInt(expiry.value, 10);
      if (!isNaN(value) && value > 0) {
        switch (expiry.unit) {
          case 'minutes': now.setMinutes(now.getMinutes() + value); break;
          case 'hours': now.setHours(now.getHours() + value); break;
          case 'days': now.setDate(now.getDate() + value); break;
          case 'weeks': now.setDate(now.getDate() + (value * 7)); break;
          case 'months': now.setMonth(now.getMonth() + value); break;
          default: now.setDate(now.getDate() + value); // Default ke hari jika unit tidak dikenal
        }
        expiresAtISO = now.toISOString();
      }
    }
    
    const currentTimeISO = new Date().toISOString();
    const insertData = {
      original_url: cleanOriginalUrl,
      shortened_url: shortenedUrl,
      click_count: 0,
      expired_at: expiresAtISO,
      created_at: currentTimeISO,
      updated_at: currentTimeISO,
      user_id: finalUserId
    };
    
    const { data: newShortUrlData, error: insertError } = await supabase
      .from('short_urls')
      .insert(insertData)
      .select()
      .single(); 
    
    if (insertError) {
      console.error("API Create - Supabase insert error:", insertError.message, JSON.stringify(insertError));
      // Cek spesifik untuk duplicate key pada shortened_url
      // Pesan error Supabase untuk unique constraint biasanya mengandung "violates unique constraint"
      if (insertError.code === '23505' || (insertError.message && insertError.message.includes('violates unique constraint'))) { 
        return NextResponse.json(
          { success: false, message: 'URL pendek yang dihasilkan (atau custom URL) sudah ada. Coba lagi atau pilih custom URL lain.' },
          { status: 409 }
        );
      }
      // Untuk error insert lainnya, kembalikan pesan server error
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan URL pendek ke database.' },
        { status: 500 }
      );
    }
    
    if (!newShortUrlData) {
      // Ini seharusnya tidak terjadi jika insertError tidak ada, tapi sebagai fallback
      return NextResponse.json(
        { success: false, message: 'Gagal membuat URL pendek setelah proses penyimpanan.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'URL pendek berhasil dibuat',
        shortUrl: {
          id: newShortUrlData.id,
          originalUrl: newShortUrlData.original_url,
          shortenedUrl: newShortUrlData.shortened_url,
          clickCount: newShortUrlData.click_count,
          expiredAt: newShortUrlData.expired_at,
          createdAt: newShortUrlData.created_at,
          updatedAt: newShortUrlData.updated_at,
          userId: newShortUrlData.user_id
        }
      },
      { status: 201 }
    );
  } catch (error) {
    // Ini adalah catch-all untuk error yang tidak terduga
    console.error("API Create - Unhandled catch error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan tidak terduga di server.' },
      { status: 500 }
    );
  }
}
