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
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Gagal membuat user baru');
    }
    
    return data[0];
  } catch (error) {
    throw error;
  }
}

export async function loginUser({ email, password }) {
  try {
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('id, name, email, password, email_verified_at') 
      .eq('email', email)
      .single();
    
    if (userFetchError || !user) {
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
    throw error; 
  }
}

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
          last_activity: nowISOString,
          payload: {} 
        }
      ]);
    
    if (error) {
      throw error;
    }
    
    cookies().set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
    
    return sessionId;
  } catch (error) {
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
    throw error;
  }
}

export async function getUserFromSession() {
  try {
    const sessionId = cookies().get('sessionId')?.value;
    if (!sessionId) return null;
    
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id, last_activity')
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
