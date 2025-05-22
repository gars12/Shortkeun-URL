import { NextResponse } from 'next/server';
import { verifyEmailToken } from '../../../../lib/emailVerification';
import { sendVerificationSuccessEmail } from '../../../../lib/emailService';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token verifikasi tidak valid' },
        { status: 400 }
      );
    }
    
    // Verifikasi token
    const result = await verifyEmailToken(token);
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Token verifikasi tidak valid atau sudah kedaluwarsa' },
        { status: 400 }
      );
    }
    
    // Jika email sudah diverifikasi sebelumnya
    if (result.alreadyVerified) {
      return NextResponse.json(
        { success: true, message: 'Email sudah diverifikasi sebelumnya' },
        { status: 200 }
      );
    }
    
    // Kirim email konfirmasi keberhasilan verifikasi
    if (result.success && result.user) {
      try {
        await sendVerificationSuccessEmail({
          to: result.user.email,
          name: result.user.name
        });
      } catch (emailError) {
        console.error('Error saat mengirim email konfirmasi verifikasi:', emailError);
        // Tetap lanjut meskipun email konfirmasi gagal terkirim
      }
    }
    
    return NextResponse.json(
      { success: true, message: 'Email berhasil diverifikasi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifikasi email:', error);
    
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat verifikasi email' },
      { status: 500 }
    );
  }
} 