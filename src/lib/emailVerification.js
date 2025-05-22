import jwt from 'jsonwebtoken';
import supabase from './supabase';
import { sendVerificationEmail, sendVerificationSuccessEmail } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'shortkeun-url-email-verification-secret';

export function generateEmailVerificationToken(userId, email) {
  return jwt.sign(
    { userId, email, purpose: 'email-verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function verifyEmailToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.purpose !== 'email-verification') {
      return null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, email_verified_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      console.error('Error mengambil user:', error);
      return null;
    }

    if (user.email_verified_at) {
      return { alreadyVerified: true, user };
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified_at: new Date().toISOString() })
      .eq('id', decoded.userId);

    if (updateError) {
      console.error('Error update email_verified_at:', updateError);
      return null;
    }

    await sendVerificationSuccessEmail({ to: user.email, name: user.name });

    return { success: true, user };
  } catch (error) {
    console.error('Error verifikasi token:', error);
    return null;
  }
}

export async function isEmailVerified(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email_verified_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error cek verifikasi email:', error);
      return false;
    }

    return !!data.email_verified_at;
  } catch (error) {
    console.error('Error cek status verifikasi:', error);
    return false;
  }
}
