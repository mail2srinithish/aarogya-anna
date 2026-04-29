/**
 * Central error handler — must be last middleware in Express chain
 */
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err.message)
  if (process.env.NODE_ENV !== 'production') console.error(err.stack)

  // Validation errors (express-validator)
  if (err.type === 'validation') {
    return res.status(422).json({ success: false, message: 'Validation failed', errors: err.errors })
  }

  // SQLite unique constraint violation
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ success: false, message: 'Record already exists' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  return res.status(401).json({ success: false, message: 'Invalid token' })
  if (err.name === 'TokenExpiredError')  return res.status(401).json({ success: false, message: 'Token expired' })

  // Known app errors with status
  if (err.status) {
    return res.status(err.status).json({ success: false, message: err.message })
  }

  // Fallback 500
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}

/**
 * 404 handler — place before errorHandler
 */
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
}

/**
 * createError — helper to throw HTTP errors
 */
function createError(status, message) {
  const err = new Error(message)
  err.status = status
  return err
}

module.exports = { errorHandler, notFound, createError }
