# Instruksi Implementasi Verifikasi Email

Untuk mengimplementasikan fitur verifikasi email dalam aplikasi ShortKeun URL, ikuti langkah-langkah berikut:

## 1. Tambahkan Kolom email_verified_at ke Tabel users

Login ke dashboard Supabase dan tambahkan kolom baru ke tabel `users`:

1. Buka project Supabase Anda
2. Pergi ke bagian "Table Editor"
3. Pilih tabel `users`
4. Klik "Add Column"
5. Isi dengan detail berikut:
   - Name: `email_verified_at`
   - Type: `timestamp with time zone`
   - Default value: `null`
   - Nullable: `true`
6. Klik "Save"

## 2. Konfigurasi Email

Edit file `.env.local` dan isi dengan konfigurasi email yang valid:

```env
# URL Aplikasi
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Ganti dengan URL aplikasi Anda

# Konfigurasi Email
EMAIL_HOST=smtp.gmail.com  # Atau provider email lain
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com  # Ganti dengan email Anda
EMAIL_PASS=your-app-password  # Ganti dengan password aplikasi email Anda

# JWT Secret untuk verifikasi email
JWT_SECRET=generate-a-strong-random-secret-key  # Ganti dengan secret key yang kuat
```

Untuk Gmail, Anda perlu membuat "App Password" khusus:
1. Buka akun Google Anda
2. Pergi ke Security > 2-Step Verification
3. Scroll ke bawah dan cari "App passwords"
4. Generate app password untuk aplikasi Anda

## 3. Restart Server

Setelah melakukan konfigurasi, restart server aplikasi:

```bash
npm run dev
```

## 4. Cara Kerja Verifikasi Email

1. Saat pengguna mendaftar, sistem akan:
   - Membuat akun dengan `email_verified_at = null`
   - Mengirim email verifikasi dengan token JWT
   - Menampilkan pesan untuk mengecek email

2. Pengguna harus mengklik link verifikasi di email mereka

3. Saat login, sistem akan memeriksa apakah email sudah diverifikasi:
   - Jika belum, akan menampilkan pesan error dan opsi untuk kirim ulang email verifikasi
   - Jika sudah, pengguna dapat login seperti biasa

## 5. Pengujian

Untuk menguji fitur ini:
1. Daftar dengan email valid
2. Cek email untuk link verifikasi (periksa folder spam jika tidak ada di inbox)
3. Klik link verifikasi
4. Coba login setelah verifikasi berhasil

## Catatan

- Pastikan SMTP server Anda diatur dengan benar dan tidak diblokir oleh firewall
- Jika menggunakan Gmail, pastikan "Less secure app access" diaktifkan atau gunakan App Password
- Untuk deployment, gunakan secret JWT yang lebih kuat 