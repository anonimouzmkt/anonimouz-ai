import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://udpmzsvvmdinsuwipvln.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcG16c3Z2bWRpbnN1d2lwdmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4OTYzMzksImV4cCI6MjA1MjQ3MjMzOX0.PkvS_QPcorwVZfY9589i2ZOBi1llFVYAl2En8q3KpnM";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: localStorage,
      storageKey: 'supabase.auth.token',
      debug: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);