const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing env vars: SUPABASE_URL, SUPABASE_ANON_KEY');
  process.exit(1);
}

// 1. Generic client (uses anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

// 2. Admin client (bypass RLS) — Only works if SERVICE_ROLE_KEY is valid
const hasAdminKey = supabaseServiceKey && supabaseServiceKey !== 'your-supabase-service-role-key-here';
const supabaseAdmin = hasAdminKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : supabase; // Fallback to anon if admin key missing

/**
 * Helper to get a Supabase client scoped to a specific user's JWT.
 * This ensures RLS is applied correctly in the backend.
 */
const getSupabase = (token) => {
  if (!token) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: { persistSession: false }
  });
};

module.exports = { supabase, supabaseAdmin, getSupabase };
