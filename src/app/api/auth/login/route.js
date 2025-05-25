// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/auth';
import { headers } from 'next/headers'; // Impor headers dari next/headers

export async function POST(request) {
  console.log('--- LOGIN API /api/auth/login HANDLER DIPANGGIL ---');
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      console.log('[API Login] Email atau password kosong diterima.');
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi.' },
        { status: 400 }
      );
    }

    // Cara yang lebih andal untuk mendapatkan IP di Vercel
    const headersList = headers(); // Dapatkan objek headers
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      headersList.get('x-real-ip')?.trim() || 
                      request.ip; // request.ip adalah fallback yang disediakan Next.js di Vercel

    const userAgent = headersList.get('user-agent');

    console.log(`[API Login] Headers - x-forwarded-for: ${headersList.get('x-forwarded-for')}`);
    console.log(`[API Login] Headers - x-real-ip: ${headersList.get('x-real-ip')}`);
    console.log(`[API Login] Vercel request.ip: ${request.ip}`);
    console.log(`[API Login] User-Agent dari headersList: ${userAgent ? userAgent.substring(0, 50) + '...' : 'N/A'}`);
    console.log(`[API Login] IP Address yang akan digunakan: ${ipAddress}`);
    
    const user = await loginUser({ 
      email, 
      password, 
      ipAddress: ipAddress || null, 
      userAgent: userAgent || null 
    });
    
    console.log('[API Login] loginUser berhasil, mengirim respons sukses.');
    return NextResponse.json(
      {
        success: true,
        message: 'Login berhasil.',
        user: { 
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API Login] Catch error di handler:', error.message, error.stack ? error.stack.split('\n').slice(0,5).join('\n') : ''); // Log stack trace lebih pendek
    const errorMessage = error.message && error.message.toLowerCase().includes('email atau password salah') 
                       ? error.message 
                       : 'Terjadi kesalahan internal saat login.';
    const errorStatus = error.message && error.message.toLowerCase().includes('email atau password salah') ? 401 : 500;
    
    return NextResponse.json(
      { success: false, message: errorMessage, details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: errorStatus } 
    );
  }
}
