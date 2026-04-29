const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const { getRecommendations, trackInteraction } = require('../controllers/recommendationController')
const { requireAuth } = require('../middleware/auth')
const { validate }    = require('../middleware/validate')

router.use(requireAuth)

router.get ('/',         getRecommendations)
router.post('/interact',
  [
    body('recipe_id').notEmpty(),
    body('action').isIn(['view','save','cook','rate','share']),
    body('value').optional().isFloat({ min: 1, max: 5 }),
  ],
  validate,
  trackInteraction
)

module.exports = router
