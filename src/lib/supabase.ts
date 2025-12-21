import { createClient } from '@supabase/supabase-js';

// These will be populated by the user in .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure URL is valid (starts with http/https) to prevent SDK crash
export const isSupabaseConfigured = supabaseUrl && supabaseUrl.startsWith('http') && !!supabaseAnonKey;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
