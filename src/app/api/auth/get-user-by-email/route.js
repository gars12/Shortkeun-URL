import { NextResponse } from 'next/server';
import supabase from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email tidak valid' },
        { status: 400 }
      );
    }
    
    // Ambil user dari database berdasarkan email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, email_verified_at')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Jika email sudah diverifikasi, tidak perlu kirim ulang
    if (user.email_verified_at) {
      return NextResponse.json(
        { success: false, message: 'Email sudah diverifikasi' },
        { status: 400 }
      );
    }
    
    // Kembalikan user ID untuk keperluan kirim ulang email verifikasi
    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.id,
          email: user.email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error mendapatkan user ID:', error);
    
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mendapatkan user ID' },
      { status: 500 }
    );
  }
} 