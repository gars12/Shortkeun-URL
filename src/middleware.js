// src/middleware.js
import { NextResponse } from 'next/server';
import supabase from './lib/supabase'; // Pastikan path ini benar

// Path publik yang tidak memerlukan autentikasi
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/pelajari',
  '/api/shorturl/redirect'  // API URL redirect publik
];

// Path API yang memerlukan autentikasi
const authApiPaths = [
  '/api/shorturl/create',
  '/api/shorturl/all',
  '/api/shorturl/delete',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }
  
  const isShortUrl = /^\/[a-zA-Z0-9_-]{1,12}$/.test(pathname);
  if (isShortUrl) {
    return NextResponse.next();
  }
  
  if (authApiPaths.some(path => pathname.startsWith(path)) || pathname.startsWith('/dashboard')) {
    const sessionId = request.cookies.get('sessionId')?.value;

    if (!sessionId) {
      if (authApiPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.json(
          { success: false, message: 'Tidak terautentikasi' },
          { status: 401 }
        );
      } 
      else {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      try {
        const { data: session, error } = await supabase
          .from('sessions')
          .select('user_id, last_activity') // last_activity akan menjadi ISO string
          .eq('id', sessionId)
          .single();
        
        if (error || !session) {
          const loginUrl = new URL('/login', request.url);
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete('sessionId');
          return response;
        }
        
        // Cek apakah session masih valid (tidak lebih dari 7 hari)
        // Konversi last_activity (ISO string) ke milliseconds untuk perbandingan
        const sessionLastActivityMs = new Date(session.last_activity).getTime();
        const currentTimeMs = Date.now();
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milidetik

        if (currentTimeMs - sessionLastActivityMs > sevenDaysInMs) {
          const loginUrl = new URL('/login', request.url);
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete('sessionId');
          return response;
        }
        
        // Update last activity dengan ISO string baru
        await supabase
          .from('sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', sessionId);
      } catch (dbError) {
        console.error("Middleware database error:", dbError);
        const loginUrl = new URL('/login', request.url);
        // Hapus cookie jika ada error saat validasi sesi
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('sessionId'); 
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
