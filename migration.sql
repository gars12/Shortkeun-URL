-- Tambahkan kolom user_id ke tabel short_urls jika belum ada
ALTER TABLE short_urls ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);

-- Update data yang sudah ada untuk menggunakan nilai default 0
UPDATE short_urls SET user_id = 0 WHERE user_id IS NULL; 