import nodemailer from 'nodemailer';

// Membuat ethereal test account untuk development
async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return testAccount;
  } catch (error) {
    console.error('Error creating test account:', error);
    throw error;
  }
}

// Konfigurasi transporter berdasarkan environment
let transporterPromise;

if (process.env.NODE_ENV === 'production') {
  // Gunakan konfigurasi email yang sebenarnya di production
  const prodTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  transporterPromise = Promise.resolve(prodTransporter);
} else {
  // Gunakan ethereal test account untuk development
  transporterPromise = createTestAccount();
}

// Fungsi umum untuk mengirim email
export async function sendEmail(options) {
  try {
    // Jika di development, gunakan Ethereal untuk testing
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await createTestAccount();
      
      // Buat transporter untuk Ethereal
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      // Kirim email
      const info = await transporter.sendMail({
        from: options.from || '"ShortKeun URL" <noreply@shortkeun-url.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      if (process.env.NODE_ENV === 'development') {
        // Preview URL hanya untuk development
        return {
          messageId: info.messageId,
          previewUrl: nodemailer.getTestMessageUrl(info),
        };
      }
      
      return {
        messageId: info.messageId,
      };
    } 
    
    // Di production, gunakan SMTP provider sungguhan (Brevo/SendinBlue)
    else {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      // Kirim email production
      const info = await transporter.sendMail({
        from: options.from || '"ShortKeun URL" <noreply@shortkeun-url.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      return {
        messageId: info.messageId,
      };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Mengirim email verifikasi ke pengguna yang baru mendaftar
 * @param {Object} options - Opsi email
 * @param {string} options.to - Email tujuan
 * @param {string} options.name - Nama penerima
 * @param {string} options.verificationToken - Token verifikasi
 * @returns {Promise} - Promise yang berisi info pengiriman email
 */
export async function sendVerificationEmail({ to, name, verificationToken }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  // HTML untuk email
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verifikasi Email - ShortKeun URL</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ShortKeun URL</h1>
        </div>
        <div class="content">
          <p>Halo ${name},</p>
          <p>Terima kasih telah mendaftar di ShortKeun URL. Untuk menyelesaikan pendaftaran, silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verifikasi Email Saya</a>
          </p>
          <p>Atau salin dan tempel URL berikut ke browser Anda:</p>
          <p>${verificationUrl}</p>
          <p>Link verifikasi ini akan kedaluwarsa dalam 24 jam.</p>
          <p>Jika Anda tidak melakukan pendaftaran di ShortKeun URL, Anda dapat mengabaikan email ini.</p>
          <p>Terima kasih,<br>Tim ShortKeun URL</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ShortKeun URL. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    // Kirim email
    const info = await sendEmail({
      to,
      subject: 'Verifikasi Email - ShortKeun URL',
      html,
      text: `Halo ${name}, Terima kasih telah mendaftar di ShortKeun URL. Untuk menyelesaikan pendaftaran, silakan buka link berikut: ${verificationUrl}`
    });
    
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

/**
 * Mengirim email pemberitahuan email berhasil diverifikasi
 * @param {Object} options - Opsi email
 * @param {string} options.to - Email tujuan
 * @param {string} options.name - Nama penerima
 * @returns {Promise} - Promise yang berisi info pengiriman email
 */
export async function sendVerificationSuccessEmail({ to, name }) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Berhasil Diverifikasi - ShortKeun URL</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ShortKeun URL</h1>
        </div>
        <div class="content">
          <p>Halo ${name},</p>
          <p>Selamat! Email Anda telah berhasil diverifikasi.</p>
          <p>Anda sekarang dapat login ke akun ShortKeun URL dan mulai membuat URL pendek:</p>
          <p style="text-align: center;">
            <a href="${loginUrl}" class="button">Login Sekarang</a>
          </p>
          <p>Terima kasih telah bergabung dengan ShortKeun URL!</p>
          <p>Salam,<br>Tim ShortKeun URL</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ShortKeun URL. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    // Kirim email
    const info = await sendEmail({
      to,
      subject: 'Email Berhasil Diverifikasi - ShortKeun URL',
      html,
      text: `Halo ${name}, Email Anda telah berhasil diverifikasi. Anda sekarang dapat login ke akun ShortKeun URL: ${loginUrl}`
    });
    
    return info;
  } catch (error) {
    console.error('Error sending verification success email:', error);
    throw error;
  }
} 