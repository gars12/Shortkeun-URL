// src/lib/auth.js
import { cookies } from 'next/headers';
import supabase from './supabase';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

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
          email_verified_at: nowISOString 
        }
      ])
      .select('id, name, email');
      
    if (error) {
      // console.error("Supabase insert error during registration:", error); // Dihapus untuk produksi
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Gagal membuat user baru');
    }
    
    return data[0];
  } catch (error) {
    // console.error("Error in registerUser:", error.message); // Dihapus untuk produksi
    throw error;
  }
}

export async function loginUser({ email, password, ipAddress, userAgent }) {
  try {
    console.log(`[loginUser] Mencoba login untuk email: ${email}, IP: ${ipAddress}, UserAgent: ${userAgent ? userAgent.substring(0, 30) + '...' : 'N/A'}`);
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('id, name, email, password, email_verified_at') 
      .eq('email', email)
      .single();
    
    if (userFetchError || !user) {
      // console.error("Supabase login user fetch error or user not found:", userFetchError); // Dihapus untuk produksi
      throw new Error('Email atau password salah.');
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Email atau password salah.');
    }
    
    delete user.password;
    
    console.log(`[loginUser] Memanggil createSession untuk userId: ${user.id}`);
    await createSession(user.id, ipAddress, userAgent); 
    
    return user;
  } catch (error) {
    // console.error("Error in loginUser:", error.message); // Dihapus untuk produksi
    throw error; 
  }
}

export async function createSession(userId, ipAddress = null, userAgent = null) {
  try {
    const sessionId = nanoid(32);
    const nowISOString = new Date().toISOString();
    
    const sessionData = { 
      id: sessionId, 
      user_id: userId, 
      created_at: nowISOString, 
      last_activity: nowISOString,
      payload: {},
      ip_address: ipAddress, 
      user_agent: userAgent
    };
    console.log('[createSession] Data yang akan diinsert ke tabel sessions:', JSON.stringify(sessionData));

    const { data: insertedSession, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select(); // Tambahkan .select() untuk mendapatkan feedback
    
    if (error) {
      console.error("[createSession] Supabase create session error:", JSON.stringify(error, null, 2));
      throw error;
    }
    console.log('[createSession] Sesi berhasil dibuat di database:', JSON.stringify(insertedSession, null, 2));
    
    cookies().set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
    
    return sessionId;
  } catch (error) {
    // console.error("Error in createSession:", error.message); // Dihapus untuk produksi
    throw error;
  }
}

export async function logout() {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    
    if (sessionId) {
      await supabase.from('sessions').delete().eq('id', sessionId);
      cookies().delete('sessionId');
    }
    return true;
  } catch (error) {
    // console.error("Error in logout:", error.message); // Dihapus untuk produksi
    throw error;
  }
}

export async function getUserFromSession() {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    if (!sessionId) return null;
    
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id, last_activity, ip_address, user_agent') // Ambil juga ip dan user_agent jika perlu
      .eq('id', sessionId)
      .single();
    
    if (sessionError || !session) {
      return null;
    }
    
    const currentTimeMs = Date.now();
    const sessionLastActivityMs = new Date(session.last_activity).getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (currentTimeMs - sessionLastActivityMs > sevenDaysInMs) { 
      await logout();
      return null;
    }
    
    // Hanya update last_activity jika ada aktivitas signifikan, atau sesuai kebutuhan
    // Untuk sekarang, kita tetap update setiap ada panggilan getUserFromSession yang valid
    await supabase
      .from('sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', sessionId);
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, email_verified_at') 
      .eq('id', session.user_id)
      .single();

    if (userError) {
        return null;
    }
            
    return user;
  } catch (error) {
    return null;
  }
}
