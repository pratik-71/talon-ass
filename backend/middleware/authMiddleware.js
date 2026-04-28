const { supabaseAdmin } = require('../config/supabase');

/**
 * requireAuth middleware
 * Validates the Supabase JWT from the Authorization header using the admin client.
 * Uses the service role key — reliable for server-side validation.
 */
const requireAuth = async (req, res, next) => {
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

module.exports = requireAuth;
