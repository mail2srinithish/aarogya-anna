const rateLimit = require('express-rate-limit')

// General API rate limit
const apiLimiter = rateLimit({
  windowMs:   15 * 60 * 1000,  // 15 minutes
  max:        300,
  message:    { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs:   15 * 60 * 1000,
  max:        20,
  message:    { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

// Chat endpoint — more generous
const chatLimiter = rateLimit({
  windowMs:   60 * 1000,        // 1 minute
  max:        30,
  message:    { success: false, message: 'Chat rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

// Sync endpoint — very strict (admin only)
const syncLimiter = rateLimit({
  windowMs:   60 * 60 * 1000,  // 1 hour
  max:        5,
  message:    { success: false, message: 'Sync rate limit exceeded.' },
})

module.exports = { apiLimiter, authLimiter, chatLimiter, syncLimiter }
