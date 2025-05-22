import { createClient } from '@supabase/supabase-js';

// URL dan API key Supabase dari environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Mohon tentukan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di environment variable');
}

// Buat client Supabase singleton
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 