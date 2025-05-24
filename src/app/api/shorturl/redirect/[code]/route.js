// src/app/api/shorturl/redirect/[code]/route.js
import { NextResponse } from 'next/server';
import { getShortUrlByCode, incrementClickCount, isExpired } from '../../../../../lib/shorturl';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request, { params }) {
  const executionStartTime = Date.now();
  let shortUrlIdForLogging = 'unknown';

  try {
    const { code } = params;
    console.log(`[Redirect API] Request diterima untuk kode: ${code} pada ${new Date().toISOString()}`);

    if (!code || code.trim() === '') {
      console.warn(`[Redirect API] Kode tidak valid atau kosong: '${code}'`);
      return NextResponse.json(
        { success: false, message: 'Kode URL tidak valid' },
        { status: 400 }
      );
    }

    console.log(`[Redirect API] Mencari URL untuk kode: ${code}`);
    const shortUrl = await getShortUrlByCode(code);
    shortUrlIdForLogging = shortUrl?.id || `not_found_for_${code}`;
    
    if (!shortUrl) {
      console.warn(`[Redirect API] URL pendek tidak ditemukan untuk kode: ${code}`);
      const notFoundRedirectUrl = new URL('/not-found', process.env.NEXT_PUBLIC_APP_URL || request.url);
      return NextResponse.redirect(notFoundRedirectUrl.toString(), { status: 302 });
    }
    console.log(`[Redirect API] URL ditemukan untuk kode ${code}: ID ${shortUrl.id}, Original URL: ${shortUrl.original_url}`);

    if (shortUrl.expired_at && isExpired(shortUrl.expired_at)) {
      console.warn(`[Redirect API] URL pendek sudah kedaluwarsa untuk kode: ${code}, ID: ${shortUrl.id}`);
      return NextResponse.json(
        { success: false, message: 'URL pendek sudah kedaluwarsa', code, expiredAt: shortUrl.expired_at },
        { status: 410 }
      );
    }

    if (!shortUrl.original_url) {
      console.error(`[Redirect API] URL tujuan kosong untuk kode: ${code}, ID: ${shortUrl.id}`);
      return NextResponse.json(
        { success: false, message: 'URL tujuan tidak ditemukan', code },
        { status: 500 }
      );
    }

    let redirectUrl = shortUrl.original_url;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
      console.log(`[Redirect API] Protokol https ditambahkan ke URL tujuan: ${redirectUrl}`);
    }

    try {
      new URL(redirectUrl);
    } catch (urlError) {
      console.error(`[Redirect API] Format URL tujuan tidak valid setelah penambahan protokol: ${redirectUrl}. Error:`, urlError);
      return NextResponse.json(
        { success: false, message: 'Format URL tujuan tidak valid', url: redirectUrl },
        { status: 500 }
      );
    }

    console.log(`[Redirect API] Memanggil incrementClickCount untuk short_url_id: ${shortUrl.id}`);
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip;
        const userAgent = request.headers.get('user-agent');
        const incrementSuccess = await incrementClickCount(shortUrl.id, ip, userAgent); 
        if (incrementSuccess) {
            console.log(`[Redirect API] incrementClickCount berhasil untuk ID: ${shortUrl.id}`);
        } else {
            console.warn(`[Redirect API] incrementClickCount mengembalikan false (kemungkinan gagal mencatat klik) untuk ID: ${shortUrl.id}`);
        }
    } catch (clickError) {
      console.error(`[Redirect API] Error saat pemanggilan incrementClickCount untuk ID: ${shortUrl.id}:`, JSON.stringify(clickError, Object.getOwnPropertyNames(clickError)));
    }

    console.log(`[Redirect API] Mengalihkan ke: ${redirectUrl} untuk kode: ${code}, ID: ${shortUrl.id}`);
    const executionEndTime = Date.now();
    console.log(`[Redirect API] Total waktu eksekusi untuk ID ${shortUrlIdForLogging}: ${executionEndTime - executionStartTime}ms`);
    return NextResponse.redirect(redirectUrl, { status: 301 });

  } catch (error) {
    const executionEndTime = Date.now();
    console.error(`[Redirect API] Error Umum pada redirect untuk ID ${shortUrlIdForLogging}:`, error.message, error.stack);
    console.log(`[Redirect API] Total waktu eksekusi (gagal) untuk ID ${shortUrlIdForLogging}: ${executionEndTime - executionStartTime}ms`);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Terjadi kesalahan internal saat proses redirect.', 
        errorDetails: error.message 
      },
      { status: 500 }
    );
  }
}
