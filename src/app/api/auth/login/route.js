// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/auth'; // Pastikan path ini benar

export async function POST(request) {
  console.log('--- LOGIN API /api/auth/login POST HANDLER CALLED ---'); // Log untuk debugging
  try {
    // Untuk sementara, kita bisa langsung kembalikan respons sukses
    // untuk memastikan handler POST ini bisa dijangkau.
    // Jika ini berhasil, masalahnya ada di dalam logika loginUser atau pemrosesan request.json().
    // return NextResponse.json({ message: 'Login API POST handler reached successfully.' }, { status: 200 });

    // Kode asli Anda:
    const { email, password } = await request.json();
    
    if (!email || !password) {
      console.log('[API Login] Email atau password kosong.');
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi.' },
        { status: 400 }
      );
    }
    
    console.log(`[API Login] Mencoba login untuk email: ${email}`);
    const user = await loginUser({ email, password });
    console.log('[API Login] loginUser berhasil, user:', user);
    
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
    console.error('[API Login] Catch error:', error.message, error.stack);
    const errorMessage = error.message && error.message.toLowerCase().includes('email atau password salah') 
                       ? error.message 
                       : 'Terjadi kesalahan internal saat login.';
    const errorStatus = error.message && error.message.toLowerCase().includes('email atau password salah') ? 401 : 500;
    
    return NextResponse.json(
      { success: false, message: errorMessage, details: error.stack }, // Sertakan stack untuk debug di dev
      { status: errorStatus } 
    );
  }
}

// Opsional: Tambahkan handler GET untuk menguji apakah file route ini dikenali sama sekali
export async function GET(request) {
  console.log('--- LOGIN API /api/auth/login GET HANDLER CALLED ---');
  return NextResponse.json({ message: 'Login API GET handler. Gunakan metode POST untuk login.' }, { status: 200 });
}
