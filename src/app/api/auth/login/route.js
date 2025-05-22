import { NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/auth';

export async function POST(request) {
  try {
    // Ambil data dari request body
    const { email, password } = await request.json();
    
    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }
    
    // Login user
    const user = await loginUser({ email, password });
    
    // Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Login berhasil',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    );
  } catch (error) {
    // Handle error
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
} 