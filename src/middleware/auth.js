/**
 * auth.js — JWT authentication middleware.
 *
 * Security fixes:
 *  - CWE-321 / Sonar S2068: removed hardcoded fallback secret.
 *    The server FAILS FAST at startup when JWT_SECRET is missing in
 *    production so a weak default can never silently reach production.
 *  - S1116: replaced empty catch block with descriptive error logging.
 */
const jwt = require('jsonwebtoken')

// ── Guard: require a real secret in production ────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.')
    process.exit(1)
  } else {
    console.warn(
      '[auth] WARNING: JWT_SECRET is not set. Using an insecure development-only ' +
      'secret. Set JWT_SECRET in .env before deploying to production.'
    )
  }
}

const EFFECTIVE_SECRET = JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production'

/**
 * Generates a signed JWT for the given payload (expires in 24 h).
 * @param {object} payload
 * @returns {string}
 */
function generateToken(payload) {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: '24h' })
}

/**
 * Express middleware — verifies Bearer JWT on protected routes.
 * Returns 401 for missing / invalid / expired tokens.
 */
function verifyToken(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' })

  const token = header.substring(7)
  try {
    req.user = jwt.verify(token, EFFECTIVE_SECRET)
    next()
  } catch (err) {
    // Expected on expired / tampered tokens — debug level only
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[auth] Token verification failed:', err.message)
    }
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = { generateToken, verifyToken }
