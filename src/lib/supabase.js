import { createClient } from '@supabase/supabase-js';
import { safeStorage } from './safeStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hybqphbbhuzdnllfytzt.supabase.co';
// Correct public anon JWT key for project hybqphbbhuzdnllfytzt
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnFwaGJiaHV6ZG5sbGZ5dHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTQ5ODEsImV4cCI6MjEwNDczMDk4MX0.GaiJu_K56DXCSQ3mmo98RYXKWPiS3l0Cf5GUoqHcsHI';

// Custom no-op lock to prevent Supabase auth-js from accessing window.localStorage for multi-tab locks in sandboxed environments
const noopLock = async (name, acquireTimeout, fn) => {
  return await fn();
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    lock: noopLock
  }
});
