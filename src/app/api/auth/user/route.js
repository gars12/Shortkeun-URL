import { NextResponse } from 'next/server';
import { getUserFromSession } from '../../../../lib/auth';

export async function GET() {
  try {
    // Ambil user dari session
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada user yang login' },
        { status: 401 }
      );
    }
    
    // Kembalikan data user (tanpa password)
    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting user:', error);
    
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
} 