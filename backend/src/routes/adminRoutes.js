const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const { getStats, listUsers, updateUserRole, getConfig, updateConfig, clearCache, getSyncLogs } = require('../controllers/adminController')
const { requireAdmin } = require('../middleware/auth')
const { syncLimiter }  = require('../middleware/rateLimiter')
const { validate }     = require('../middleware/validate')
const syncService      = require('../services/syncService')

router.use(requireAdmin)

router.get ('/stats',        getStats)
router.get ('/users',        listUsers)
router.put ('/users/:id/role',
  [body('role').isIn(['user','admin'])], validate, updateUserRole
)
router.get ('/config',       getConfig)
router.post('/config',
  [body('key_name').notEmpty(), body('value').notEmpty()], validate, updateConfig
)
router.post('/cache/clear',  clearCache)
router.get ('/sync-logs',    getSyncLogs)

// Manual sync trigger
router.post('/sync',
  syncLimiter,
  async (req, res, next) => {
    try {
      const { source = 'all' } = req.body
      // Run async — don't await
      syncService.runSync(source).catch((err) => console.error('Sync error:', err.message))
      res.json({ success: true, message: `Sync triggered for: ${source}` })
    } catch (err) {
      next(err)
    }
  }
)

module.exports = router
