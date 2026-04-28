const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] ⚠ Missing SUPABASE_URL or SUPABASE_ANON_KEY env variables');
}

// Initialize clients only if URLs are present to avoid crashing the serverless function
let supabase;
let supabaseAdmin;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} else {
  console.error('[Supabase] CRITICAL: SUPABASE_URL or SUPABASE_ANON_KEY is missing!');
}

module.exports = supabase;
module.exports.supabaseAdmin = supabaseAdmin;
