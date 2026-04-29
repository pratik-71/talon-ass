const { supabaseAdmin } = require('../config/supabase');

/**
 * requireAuth middleware
 * Validates the Supabase JWT from the Authorization header using the admin client.
 * Uses the service role key — reliable for server-side validation.
 */
const requireAuth = async (req, res, next) => {
  if (!supabaseAdmin) {
    console.error('[Auth Middleware] Supabase Admin client NOT initialized!');
    return res.status(500).json({ success: false, error: 'Auth service unavailable.' });
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorised. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      console.warn('[Auth Middleware] Token validation failed:', error?.message);
      return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
    }

    req.user = { id: data.user.id, email: data.user.email };
    next();
  } catch (err) {
    console.error('[Auth Middleware] Unexpected error:', err.message);
    return res.status(500).json({ success: false, error: 'Authentication service error.' });
  }
};

/**
 * requireAdmin middleware
 * MUST be used AFTER requireAuth.
 * Checks the user_profiles table to ensure the user has the 'admin' role.
 */
const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, error: 'Unauthorised. Admin verification failed.' });
  }

  try {
    // 1. First, check Supabase Auth metadata (fastest and most reliable for our setup)
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.admin.getUserById(req.user.id);
    
    if (!authErr && user?.user_metadata?.role === 'admin') {
      return next();
    }

    // 2. Fallback: Check the user_profiles table (legacy or custom roles)
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || profile?.role !== 'admin') {
      console.warn(`[Admin Middleware] Access denied for user: ${req.user.id}`);
      return res.status(403).json({ success: false, error: 'Forbidden. Admin privileges required.' });
    }

    next();
  } catch (err) {
    console.error('[Admin Middleware] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Admin verification error.' });
  }
};

module.exports = { requireAuth, requireAdmin };
