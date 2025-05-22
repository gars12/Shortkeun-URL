-- Script untuk membersihkan database Supabase
-- AWAS: Script ini akan menghapus data pengguna dan URL pendek
-- Gunakan dengan hati-hati di lingkungan development

-- Hapus semua URL pendek (kecuali yang dibuat oleh Anonymous User dengan ID 1)
DELETE FROM short_urls WHERE user_id != 1;

-- Hapus semua sesi
DELETE FROM sessions;

-- Hapus semua pengguna kecuali Anonymous User
DELETE FROM users WHERE id != 1;

-- Reset sequence untuk ID pengguna agar dimulai dari angka yang lebih kecil
-- Sesuaikan dengan ID terakhir + 1 dari Anonymous User
ALTER SEQUENCE users_id_seq RESTART WITH 2;

-- Reset sequence untuk ID URL pendek
-- Cek ID terakhir dari URL yang tersisa dan tambahkan 1
SELECT setval('short_urls_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM short_urls), false);

-- Konfirmasi hasil
SELECT COUNT(*) AS remaining_users FROM users;
SELECT COUNT(*) AS remaining_urls FROM short_urls;
SELECT COUNT(*) AS remaining_sessions FROM sessions; 