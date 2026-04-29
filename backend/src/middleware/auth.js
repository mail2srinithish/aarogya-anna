const passport = require('passport')

/**
 * requireAuth — protect any route with JWT Bearer token.
 * Attaches req.user = { id, email, name, role }
 */
function requireAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err)    return next(err)
    if (!user)  return res.status(401).json({ success: false, message: 'Unauthorised — invalid or expired token' })
    req.user = user
    next()
  })(req, res, next)
}

/**
 * requireAdmin — must be authenticated + have role='admin'
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden — admin access required' })
    }
    next()
  })
}

/**
 * optionalAuth — attaches user if token present, proceeds regardless
 */
function optionalAuth(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) req.user = user
    next()
  })(req, res, next)
}

module.exports = { requireAuth, requireAdmin, optionalAuth }
