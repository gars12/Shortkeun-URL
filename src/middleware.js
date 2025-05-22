import { NextResponse } from 'next/server';
import supabase from './lib/supabase';

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
  
  // Jika ini merupakan path publik, biarkan request lanjut
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }
  
  // Cek apakah ini URL pendek (pola /{kode})
  const isShortUrl = /^\/[a-zA-Z0-9_-]{1,12}$/.test(pathname);
  if (isShortUrl) {
    return NextResponse.next();
  }
  
  // Periksa apakah pengguna terautentikasi untuk endpoint yang memerlukan auth
  if (authApiPaths.some(path => pathname.startsWith(path)) || pathname.startsWith('/dashboard')) {
    const sessionId = request.cookies.get('sessionId')?.value;

    if (!sessionId) {
      // Jika ini API call, kembalikan response 401
      if (authApiPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.json(
          { success: false, message: 'Tidak terautentikasi' },
          { status: 401 }
        );
      } 
      // Jika bukan API call, redirect ke halaman login
      else {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } else {
      // Validasi sessionId dengan database
      try {
        // Ambil session dari database
        const { data: session, error } = await supabase
          .from('sessions')
          .select('user_id, last_activity')
          .eq('id', sessionId)
          .single();
        
        // Jika session tidak valid, redirect ke login
        if (error || !session) {
          // Hapus cookie yang tidak valid
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete('sessionId');
          return response;
        }
        
        // Cek apakah session masih valid (tidak lebih dari 7 hari)
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - session.last_activity > 60 * 60 * 24 * 7) {
          // Hapus cookie yang kedaluwarsa
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete('sessionId');
          return response;
        }
        
        // Update last activity
        await supabase
          .from('sessions')
          .update({ last_activity: currentTime })
          .eq('id', sessionId);
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
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