import { NextResponse } from 'next/server';
import { resendVerificationEmail } from '../../../../lib/auth';

export async function POST(request) {
  try {
    // Ambil user ID dari request body
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID tidak valid' },
        { status: 400 }
      );
    }
    
    // Kirim ulang email verifikasi
    await resendVerificationEmail(userId);
    
    return NextResponse.json(
      { success: true, message: 'Email verifikasi telah dikirim ulang. Silakan cek inbox email Anda.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error kirim ulang email verifikasi:', error);
    
    // Error handling khusus
    if (error.message === 'Email sudah diverifikasi') {
      return NextResponse.json(
        { success: false, message: 'Email sudah diverifikasi' },
        { status: 400 }
      );
    }
    
    if (error.message === 'User tidak ditemukan') {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengirim ulang email verifikasi' },
      { status: 500 }
    );
  }
} 