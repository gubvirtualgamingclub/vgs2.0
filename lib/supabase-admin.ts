import { createClient } from '@supabase/supabase-js';

// Admin Supabase client with Service Role Key
// This client bypasses Row Level Security (RLS) - USE WITH CAUTION
// Only use in server-side API routes, never in client-side code

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.warn(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Admin operations may fail.'
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
