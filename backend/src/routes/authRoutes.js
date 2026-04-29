const express  = require('express')
const { body } = require('express-validator')
const passport = require('passport')
const router   = express.Router()

const { register, login, refreshToken, logout, googleCallback, getMe, changePassword } = require('../controllers/authController')
const { authLimiter } = require('../middleware/rateLimiter')
const { requireAuth }  = require('../middleware/auth')
const { validate }     = require('../middleware/validate')

// ─── Validation schemas ───────────────────────────────────────────────────────
const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
]

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
]

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post('/register',  authLimiter, registerRules,  validate, register)
router.post('/login',     authLimiter, loginRules,     validate, login)
router.post('/refresh',   authLimiter, refreshToken)
router.post('/logout',    logout)
router.get ('/me',        requireAuth, getMe)
router.put ('/password',  requireAuth,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate, changePassword
)

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
)

module.exports = router
