import { cookies } from 'next/headers';
import supabase from './supabase';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { generateEmailVerificationToken } from './emailVerification';
import { sendVerificationEmail } from './emailService';

// Register user
export async function registerUser({ name, email, password }) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert ke tabel users
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          name, 
          email, 
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
          email_verified_at: null // Email belum terverifikasi
        }
      ])
      .select('id, name, email');
      
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Gagal membuat user baru');
    }
    
    // Buat token verifikasi email
    const verificationToken = generateEmailVerificationToken(data[0].id, email);
    
    // Kirim email verifikasi
    try {
      await sendVerificationEmail({
        to: email,
        name,
        verificationToken
      });
    } catch (emailError) {
      // Jangan gagalkan proses registrasi jika email gagal terkirim
    }

    // TIDAK membuat session otomatis lagi
    // Pengguna harus memverifikasi email terlebih dahulu
    
    return data[0];
  } catch (error) {
    throw error;
  }
}

// Login user
export async function loginUser({ email, password }) {
  // Ambil user dari database
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, password, email_verified_at')
    .eq('email', email)
    .single();
  
  if (error || !user) throw new Error('Email atau password salah');
  
  // Verifikasi password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Email atau password salah');
  
  // Periksa apakah email sudah diverifikasi
  if (!user.email_verified_at) {
    throw new Error('Email belum diverifikasi. Silakan cek inbox email Anda untuk link verifikasi.');
  }
  
  // Hapus password dari object user
  delete user.password;
  
  // Buat session
  await createSession(user.id);
  
  return user;
}

// Buat session baru
export async function createSession(userId) {
  const sessionId = nanoid(32);
  const now = new Date().toISOString();
  
  // Insert ke tabel sessions
  const { error } = await supabase
    .from('sessions')
    .insert([
      { 
        id: sessionId, 
        user_id: userId, 
        created_at: now,
        last_activity: now,
        payload: {} // Tambahkan empty JSON object untuk kolom payload
      }
    ]);
  
  if (error) throw error;
  
  // Set cookie untuk session
  cookies().set('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/'
  });
  
  return sessionId;
}

// Logout user
export async function logout() {
  const sessionId = cookies().get('sessionId')?.value;
  
  if (sessionId) {
    // Hapus session dari database
    await supabase.from('sessions').delete().eq('id', sessionId);
    
    // Hapus cookie
    cookies().delete('sessionId');
  }
  
  return true;
}

// Ambil user dari session
export async function getUserFromSession() {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) return null;
  
  // Ambil session dari database
  const { data: session, error } = await supabase
    .from('sessions')
    .select('user_id, last_activity')
    .eq('id', sessionId)
    .single();
  
  if (error || !session) return null;
  
  // Cek apakah session masih valid (tidak lebih dari 7 hari)
  const currentTime = new Date();
  const sessionTime = new Date(session.last_activity);
  const diffDays = (currentTime - sessionTime) / (1000 * 60 * 60 * 24);
  
  if (diffDays > 7) {
    await logout();
    return null;
  }
  
  // Update last activity
  await supabase
    .from('sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', sessionId);
  
  // Ambil user dari database dengan tambahan kolom email_verified_at
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, email_verified_at')
    .eq('id', session.user_id)
    .single();
  
  // Jika user ditemukan tetapi email belum diverifikasi, logout dan kembalikan null
  if (user && !user.email_verified_at) {
    await logout(); // Hapus session
    return null; // Paksa pengguna untuk login ulang setelah memverifikasi email
  }
  
  return user;
}

// Kirim ulang email verifikasi
export async function resendVerificationEmail(userId) {
  try {
    // Ambil data user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, email_verified_at')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      throw new Error('User tidak ditemukan');
    }
    
    // Cek apakah email sudah diverifikasi
    if (user.email_verified_at) {
      throw new Error('Email sudah diverifikasi');
    }
    
    // Buat token verifikasi baru
    const verificationToken = generateEmailVerificationToken(user.id, user.email);
    
    // Kirim email verifikasi
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationToken
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
} 