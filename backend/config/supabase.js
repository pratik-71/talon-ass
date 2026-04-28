const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] ⚠ Missing SUPABASE_URL or SUPABASE_ANON_KEY env variables');
}

// Public client (anon key) — for user-facing auth operations like login/register
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (service role key) — for server-side JWT validation, bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

module.exports = supabase;
module.exports.supabaseAdmin = supabaseAdmin;
