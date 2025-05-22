-- Ubah kolom user_id untuk bisa menerima nilai NULL atau set default 0
ALTER TABLE short_urls ALTER COLUMN user_id DROP NOT NULL;
 
-- Pastikan semua baris yang memiliki user_id NULL diubah ke 0
UPDATE short_urls SET user_id = 0 WHERE user_id IS NULL; 