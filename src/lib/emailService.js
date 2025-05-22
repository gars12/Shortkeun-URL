import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fungsi umum untuk kirim email
 */
export async function sendEmail({ to, subject, text, html, from }) {
  try {
    const data = await resend.emails.send({
      from: from || 'ShortKeun URL <noreply@shortkeun-url.com>',
      to,
      subject,
      text,
      html,
    });

    return {
      messageId: data.id,
    };
  } catch (error) {
    console.error('❌ Error sending email via Resend:', error);
    throw error;
  }
}

/**
 * Kirim email verifikasi ke user baru
 */
export async function sendVerificationEmail({ to, name, verificationToken }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

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
        <div class="header"><h1>ShortKeun URL</h1></div>
        <div class="content">
          <p>Halo ${name},</p>
          <p>Terima kasih sudah daftar. Klik tombol di bawah untuk verifikasi email kamu:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verifikasi Email Saya</a>
          </p>
          <p>Atau copy link ini ke browser kamu:</p>
          <p>${verificationUrl}</p>
          <p>Link ini expired dalam 24 jam.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShortKeun URL
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Halo ${name}, verifikasi email kamu di sini: ${verificationUrl}`;

  return await sendEmail({
    to,
    subject: 'Verifikasi Email - ShortKeun URL',
    html,
    text,
  });
}

/**
 * Kirim email konfirmasi kalau email berhasil diverifikasi
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
        <div class="header"><h1>ShortKeun URL</h1></div>
        <div class="content">
          <p>Halo ${name},</p>
          <p>Email kamu udah berhasil diverifikasi. Langsung login yuk:</p>
          <p style="text-align: center;">
            <a href="${loginUrl}" class="button">Login Sekarang</a>
          </p>
          <p>Terima kasih udah gabung!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ShortKeun URL
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Halo ${name}, email kamu udah diverifikasi. Login di sini: ${loginUrl}`;

  return await sendEmail({
    to,
    subject: 'Email Berhasil Diverifikasi - ShortKeun URL',
    html,
    text,
  });
}
