# ShortKeun URL

ShortKeun URL adalah aplikasi web pemendek URL yang dibangun dengan Next.js dan Supabase. Aplikasi ini memungkinkan pengguna untuk memendekkan URL panjang dan melacak penggunaan tautan yang dipendekkan.

## Fitur

- **Autentikasi Pengguna:** Pengguna dapat mendaftar, masuk, dan mengelola URL mereka.
- **Pemendekan URL:** Pengguna dapat memendekkan URL panjang menjadi URL yang lebih pendek.
- **Custom Slug:** Pengguna dapat membuat URL pendek dengan nama kustom.
- **Pelacakan Klik:** Setiap kali URL pendek diakses, aplikasi melacak jumlah klik.
- **URL Expiry:** URL yang dipendekkan dapat memiliki waktu kedaluwarsa.

## Teknologi yang Digunakan

- **Next.js**: Framework React untuk aplikasi full-stack
- **Supabase**: Platform backend dengan PostgreSQL database
- **Tailwind CSS**: Framework CSS untuk styling
- **bcryptjs**: Untuk hashing password

## Struktur Database PostgreSQL

Aplikasi ini menggunakan tabel-tabel berikut di PostgreSQL melalui Supabase:

- **users**: Menyimpan data pengguna
- **sessions**: Menyimpan sesi pengguna
- **short_urls**: Menyimpan data URL pendek

## Cara Menjalankan Aplikasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/username/shortkeun-url.git
   cd shortkeun-url
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Buat file `.env.local` dengan variabel lingkungan berikut:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Jalankan aplikasi dalam mode development:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Setup Supabase

1. Buat akun dan proyek baru di [Supabase](https://supabase.com/).
2. Gunakan file SQL berikut untuk membuat tabel yang diperlukan:
   - Buka SQL Editor di dashboard Supabase
   - Jalankan script SQL di file `supabase-schema.sql` yang tersedia di repositori ini
   - Script ini akan membuat tabel users, sessions, short_urls, dan fungsi increment
3. Salin URL proyek dan anonymous key dari tab "API" di dashboard Supabase Anda.
4. Tambahkan URL dan key tersebut ke file `.env.local` Anda.

## Troubleshooting

Jika terjadi error saat registrasi atau login:
1. Pastikan tabel users, sessions, dan short_urls sudah dibuat di database Supabase
2. Pastikan fungsi increment sudah dibuat di database Supabase
3. Verifikasi URL dan API key Supabase di file .env.local sudah benar
4. Periksa log error di console browser atau terminal server

## Deployment ke Vercel

Aplikasi ini siap untuk di-deploy ke Vercel. Pastikan untuk menambahkan variabel lingkungan yang sama di pengaturan proyek Vercel.

1. Push kode ke repositori GitHub Anda.
2. Buat proyek baru di Vercel dan hubungkan dengan repositori GitHub.
3. Tambahkan variabel lingkungan yang diperlukan di pengaturan proyek Vercel.
4. Deploy aplikasi.

## Struktur Proyek

```
shortkeun-url/
├── src/
│   ├── app/               # Halaman aplikasi (Next.js App Router)
│   ├── components/        # Komponen React
│   ├── lib/               # Utilitas dan helper functions
├── public/                # File statis
└── ...
```

## Lisensi

[MIT](https://choosealicense.com/licenses/mit/)
