-- File: migration_sessions.sql

-- Pertama, pastikan tabel sessions ada
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    payload JSONB DEFAULT '{}'::jsonb
);

-- Jika tabel sudah ada, coba tambahkan kolom yang hilang
DO $$
BEGIN
    -- Coba tambahkan kolom created_at jika belum ada
    BEGIN
        ALTER TABLE sessions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    EXCEPTION 
        WHEN duplicate_column THEN
            -- Kolom sudah ada, jadi lakukan update tipe data jika perlu
            BEGIN
                ALTER TABLE sessions ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING
                CASE 
                    WHEN created_at IS NOT NULL THEN 
                        CASE 
                            WHEN created_at::text ~ E'^\\d+$' THEN 
                                to_timestamp(created_at::numeric)
                            ELSE 
                                created_at::timestamp with time zone
                        END
                    ELSE now() 
                END;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error mengubah tipe kolom created_at: %', SQLERRM;
            END;
    END;

    -- Hal yang sama untuk last_activity
    BEGIN
        ALTER TABLE sessions ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE DEFAULT now();
    EXCEPTION 
        WHEN duplicate_column THEN
            -- Kolom sudah ada, jadi lakukan update tipe data jika perlu
            BEGIN
                ALTER TABLE sessions ALTER COLUMN last_activity TYPE TIMESTAMP WITH TIME ZONE USING
                CASE 
                    WHEN last_activity IS NOT NULL THEN 
                        CASE 
                            WHEN last_activity::text ~ E'^\\d+$' THEN 
                                to_timestamp(last_activity::numeric)
                            ELSE 
                                last_activity::timestamp with time zone
                        END
                    ELSE now() 
                END;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error mengubah tipe kolom last_activity: %', SQLERRM;
            END;
    END;

    -- Tambahkan kolom payload jika belum ada
    BEGIN
        ALTER TABLE sessions ADD COLUMN payload JSONB DEFAULT '{}'::jsonb NOT NULL;
    EXCEPTION 
        WHEN duplicate_column THEN
            -- Kolom sudah ada, pastikan tipe data benar
            BEGIN
                -- Atur nilai default untuk baris yang sudah ada dengan payload NULL
                UPDATE sessions SET payload = '{}'::jsonb WHERE payload IS NULL;
                -- Buat constraint NOT NULL
                ALTER TABLE sessions ALTER COLUMN payload SET NOT NULL;
                -- Atur nilai default untuk baris baru
                ALTER TABLE sessions ALTER COLUMN payload SET DEFAULT '{}'::jsonb;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Error mengubah kolom payload: %', SQLERRM;
            END;
    END;

    -- Reset cache schema untuk memastikan PostgREST mengenali perubahan
    NOTIFY pgrst, 'reload schema';
END $$; 