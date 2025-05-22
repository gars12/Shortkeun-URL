/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi untuk Vercel deployment
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  },
  // Konfigurasi tambahan
  reactStrictMode: true,
};

module.exports = nextConfig; 