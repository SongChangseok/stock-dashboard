import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { env } from './env';

// Initialize Supabase client
let supabase: ReturnType<typeof createClient<Database>>;

try {
  // Create Supabase client using centralized env configuration
  supabase = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  if (env.isDevelopment) {
    console.log('Supabase initialized successfully');
  }
} catch (error) {
  console.error('Supabase initialization error:', error);
  throw error;
}

// Export Supabase client
export { supabase };

// Export Supabase configuration for debugging
export const getSupabaseConfig = () => ({
  url: env.supabase.url,
  anonKey: env.supabase.anonKey ? '***' : '',
});

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    console.log('Supabase connection check:', data.session ? 'authenticated' : 'not authenticated');
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};