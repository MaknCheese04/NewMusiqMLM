import { createClient } from '@supabase/supabase-js';
import { safeStorage } from './safeStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hybqphbbhuzdnllfytzt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sbp_fc04cdbf9df7a0f3e41602a8e07146279a63e621';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
