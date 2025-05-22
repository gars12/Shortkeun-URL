import jwt from 'jsonwebtoken';
import supabase from './supabase';

// Secret key untuk menandatangani token JWT (sebaiknya disimpan di environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'shortkeun-url-email-verification-secret';

/**
 * Membuat token verifikasi email untuk user baru
 * @param {string} userId - ID user yang perlu diverifikasi emailnya
 * @param {string} email - Email user
 * @returns {string} - Token JWT untuk verifikasi email
 */
export function generateEmailVerificationToken(userId, email) {
  // Token verifikasi berlaku 24 jam (86400 detik)
  return jwt.sign(
    { userId, email, purpose: 'email-verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Memverifikasi token verifikasi email
 * @param {string} token - Token verifikasi yang diterima
 * @returns {Object} - Data user jika token valid, null jika tidak valid
 */
export async function verifyEmailToken(token) {
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Cek apakah token untuk tujuan verifikasi email
    if (decoded.purpose !== 'email-verification') {
      return null;
    }

    // Ambil user dari database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, email_verified_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      console.error('Error saat mengambil user:', error);
      return null;
    }

    // Jika email sudah diverifikasi, tidak perlu dilakukan lagi
    if (user.email_verified_at) {
      return { alreadyVerified: true, user };
    }

    // Verifikasi email dengan mengupdate kolom email_verified_at
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified_at: new Date().toISOString() })
      .eq('id', decoded.userId);

    if (updateError) {
      console.error('Error saat update email_verified_at:', updateError);
      return null;
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error saat verifikasi token email:', error);
    return null;
  }
}

/**
 * Cek apakah email user sudah diverifikasi
 * @param {string} userId - ID user
 * @returns {Promise<boolean>} - true jika email sudah diverifikasi, false jika belum
 */
export async function isEmailVerified(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email_verified_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error cek status verifikasi email:', error);
      return false;
    }

    return !!data.email_verified_at;
  } catch (error) {
    console.error('Error cek status verifikasi email:', error);
    return false;
  }
} 