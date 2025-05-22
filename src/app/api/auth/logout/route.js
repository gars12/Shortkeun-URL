import { NextResponse } from 'next/server';
import { logout } from '../../../../lib/auth';

export async function POST() {
  try {
    // Lakukan logout
    await logout();

    return NextResponse.json(
      {
        success: true,
        message: 'Logout berhasil',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error logout:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
} 