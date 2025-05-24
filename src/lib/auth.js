// src/lib/auth.js
import { cookies } from 'next/headers';
import supabase from './supabase';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// Register user (setelah penghapusan verifikasi email)
export async function registerUser({ name, email, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const nowISOString = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          name, 
          email, 
          password: hashedPassword,
          created_at: nowISOString,
          updated_at: nowISOString,
          email_verified_at: nowISOString // Pengguna langsung terverifikasi
        }
      ])
      .select('id, name, email');
      
    if (error) {
      console.error('Supabase insert error during registration:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Gagal membuat user baru');
    }
        
    // Jika Anda ingin pengguna langsung login setelah registrasi:
    // await createSession(data[0].id); 
    
    return data[0];
  } catch (error) {
    console.error('Error in registerUser:', error.message, error.stack);
    throw error;
  }
}

// Login user
export async function loginUser({ email, password }) {
  try {
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('id, name, email, password, email_verified_at') 
      .eq('email', email)
      .single();
    
    if (userFetchError || !user) {
      console.error('Supabase login user fetch error or user not found:', userFetchError);
      throw new Error('Email atau password salah.');
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Email atau password salah.');
    }
    
    delete user.password;
    
    await createSession(user.id); 
    
    return user;
  } catch (error) {
    console.error('Error in loginUser:', error.message, error.stack);
    throw error; 
  }
}

// Buat session baru
export async function createSession(userId) {
  try {
    const sessionId = nanoid(32);
    const nowISOString = new Date().toISOString();
    
    const { error } = await supabase
      .from('sessions')
      .insert([
        { 
          id: sessionId, 
          user_id: userId, 
          created_at: nowISOString, 
          last_activity: nowISOString, // Menggunakan ISO string
          payload: {} 
        }
      ]);
    
    if (error) {
      console.error('Supabase create session error:', error);
      throw error;
    }
    
    cookies().set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/'
    });
    
    return sessionId;
  } catch (error) {
    console.error('Error in createSession:', error.message, error.stack);
    throw error;
  }
}

// Logout user
export async function logout() {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    
    if (sessionId) {
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
      if (error) {
        console.error('Supabase delete session error during logout:', error);
      }
      cookies().delete('sessionId');
    }
    return true;
  } catch (error) {
    console.error('Error in logout:', error.message, error.stack);
    throw error;
  }
}

// Ambil user dari session
export async function getUserFromSession() {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    if (!sessionId) return null;
    
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id, last_activity') // last_activity akan menjadi ISO string
      .eq('id', sessionId)
      .single();
    
    if (sessionError || !session) {
      if (sessionError) console.error('Supabase get session error:', sessionError);
      return null;
    }
    
    const currentTimeMs = Date.now();
    const sessionLastActivityMs = new Date(session.last_activity).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (currentTimeMs - sessionLastActivityMs > sevenDaysInMs) { 
      await logout();
      return null;
    }
    
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ last_activity: new Date().toISOString() }) // Update dengan ISO string baru
      .eq('id', sessionId);

    if (updateError) {
        console.error('Supabase update last_activity error:', updateError);
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, email_verified_at') 
      .eq('id', session.user_id)
      .single();

    if (userError) {
        console.error('Supabase get user from session error:', userError);
        return null;
    }
        
    return user;
  } catch (error) {
    console.error('Error in getUserFromSession:', error.message, error.stack);
    return null;
  }
}
