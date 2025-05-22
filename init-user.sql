-- Tambahkan user anonim default ke database
INSERT INTO users (id, name, email, password, created_at, updated_at)
VALUES (1, 'Anonymous User', 'anonymous@shortkeun.com', 'nopassword', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Ubah kolom user_id di tabel short_urls untuk mengizinkan NULL
ALTER TABLE short_urls ALTER COLUMN user_id DROP NOT NULL; 