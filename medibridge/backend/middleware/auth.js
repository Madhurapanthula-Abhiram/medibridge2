const { supabase } = require('../supabaseClient');

/**
 * Middleware: verify Supabase JWT and attach user to req.user
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Validate the JWT with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid or expired token', error: error?.message });
    }

    req.user = data.user;   // Supabase User object { id, email, ... }
    req.token = token;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error:', err.message);
    res.status(401).json({ message: 'Token verification failed', error: err.message });
  }
};

module.exports = { auth };
