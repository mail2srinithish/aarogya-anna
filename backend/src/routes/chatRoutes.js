const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const { createSession, getSession, listSessions, sendMessage, deleteSession, publicChat } = require('../controllers/chatController')
const { requireAuth }  = require('../middleware/auth')
const { chatLimiter }  = require('../middleware/rateLimiter')
const { validate }     = require('../middleware/validate')

// Public endpoint — no login required
router.post('/public',
  chatLimiter,
  [body('message').trim().isLength({ min: 1, max: 4000 }).withMessage('Message must be 1–4000 chars')],
  validate,
  publicChat
)

router.use(requireAuth)

router.get   ('/',                  listSessions)
router.post  ('/',                  createSession)
router.get   ('/:sessionId',        getSession)
router.delete('/:sessionId',        deleteSession)
router.post  ('/:sessionId/message',
  chatLimiter,
  [body('message').trim().isLength({ min: 1, max: 4000 }).withMessage('Message must be 1–4000 chars')],
  validate,
  sendMessage
)

module.exports = router
