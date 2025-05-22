import { NextResponse } from 'next/server';
import { getShortUrlByCode, incrementClickCount, isExpired } from '../../../../../lib/shorturl';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    console.log(`[Redirect API] Processing redirect for code: ${code}`);

    if (!code || code.trim() === '') {
      console.log(`[Redirect API] Invalid code provided`);
      return NextResponse.json(
        { success: false, message: 'Kode URL tidak valid' },
        { status: 400 }
      );
    }

    // Log untuk debugging
    console.log(`[Redirect API] Request URL: ${request.url}`);
    console.log(`[Redirect API] Headers:`, Object.fromEntries(request.headers.entries()));

    // Ambil URL pendek dari database dengan retry
    let shortUrl = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!shortUrl && attempts < maxAttempts) {
      attempts++;
      console.log(`[Redirect API] Attempt ${attempts} to get URL for code: ${code}`);
      shortUrl = await getShortUrlByCode(code);
      
      if (!shortUrl && attempts < maxAttempts) {
        console.log(`[Redirect API] Retry after short delay...`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay 200ms sebelum retry
      }
    }
    
    console.log(`[Redirect API] Short URL found after ${attempts} attempts:`, shortUrl);

    // Jika URL tidak ditemukan setelah semua percobaan
    if (!shortUrl) {
      console.log(`[Redirect API] Short URL not found for code: ${code} after ${maxAttempts} attempts`);
      return NextResponse.json(
        { success: false, message: 'URL pendek tidak ditemukan', code },
        { status: 404 }
      );
    }

    // Cek apakah URL sudah expired
    if (shortUrl.expired_at && isExpired(shortUrl.expired_at)) {
      console.log(`[Redirect API] Short URL expired at: ${shortUrl.expired_at}`);
      return NextResponse.json(
        { success: false, message: 'URL pendek sudah expired', code, expiredAt: shortUrl.expired_at },
        { status: 410 } // Gone
      );
    }

    // Validasi URL tujuan
    if (!shortUrl.original_url) {
      console.log(`[Redirect API] Missing destination URL for code: ${code}`);
      return NextResponse.json(
        { success: false, message: 'URL tujuan tidak ditemukan', code },
        { status: 500 }
      );
    }

    // Pastikan URL memiliki protokol
    let redirectUrl = shortUrl.original_url;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
      console.log(`[Redirect API] Added https protocol to URL: ${redirectUrl}`);
    }

    // Validasi URL setelah menambahkan protokol
    try {
      new URL(redirectUrl); // Akan throw error jika URL tidak valid
    } catch (urlError) {
      console.error(`[Redirect API] Invalid URL format after adding protocol:`, urlError);
      return NextResponse.json(
        { success: false, message: 'Format URL tujuan tidak valid', url: redirectUrl },
        { status: 500 }
      );
    }

    // Tambahkan jumlah klik
    console.log(`[Redirect API] Incrementing click count for ID: ${shortUrl.id}, current count: ${shortUrl.click_count || 0}`);
    try {
      const updatedUrl = await incrementClickCount(shortUrl.id);
      console.log(`[Redirect API] Successfully incremented click count. New count: ${updatedUrl?.click_count}`);
    } catch (clickError) {
      console.error(`[Redirect API] Error incrementing click count:`, clickError);
      // Lanjutkan proses redirect meskipun gagal menambah jumlah klik
    }

    // Redirect ke URL asli
    console.log(`[Redirect API] Redirecting to original URL: ${redirectUrl}`);
    
    // Gunakan permanent redirect (301) sehingga browser mengingat redirect
    return NextResponse.redirect(redirectUrl, { status: 301 });
  } catch (error) {
    console.error('[Redirect API] Error redirecting URL pendek:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan saat redirect', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 