// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/auth'; // Pastikan path ini benar

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi.' },
        { status: 400 }
      );
    }
    
    // Memanggil fungsi loginUser yang sudah diimpor
    const user = await loginUser({ email, password });
    
    // Jika loginUser berhasil, user akan berisi data pengguna
    return NextResponse.json(
      {
        success: true,
        message: 'Login berhasil.',
        user: { // Kembalikan data user yang aman
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 200 } // Status 200 OK untuk login berhasil
    );
  } catch (error) {
    console.error('API Login error:', error.message); // Log error di sisi server
    // Mengembalikan pesan error yang diterima dari loginUser atau pesan generik
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan internal saat login.' },
      // Status 401 untuk kredensial salah, 500 untuk error server lainnya
      { status: error.message.toLowerCase().includes('email atau password salah') ? 401 : 500 } 
    );
  }
}
