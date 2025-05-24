import { NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const user = await registerUser({ name, email, password });

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil. Anda sekarang dapat login.', // Pesan disesuaikan karena tidak ada verifikasi email
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // console.error('API Registrasi error:', error); // Hapus untuk production
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) { // Periksa juga unique constraint
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
