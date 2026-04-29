const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const { upsertProfile, getProfile, getDashboard, logWater, logNutrition } = require('../controllers/profileController')
const { requireAuth } = require('../middleware/auth')
const { validate }    = require('../middleware/validate')

const profileRules = [
  body('age').isInt({ min: 5, max: 120 }).withMessage('Age must be 5–120'),
  body('gender').isIn(['male','female','other']),
  body('weight_kg').isFloat({ min: 20, max: 300 }).withMessage('Weight must be 20–300 kg'),
  body('height_cm').isFloat({ min: 50, max: 250 }).withMessage('Height must be 50–250 cm'),
  body('activity_level').isIn(['sedentary','light','moderate','active','very_active']),
  body('diet_type').isIn(['vegetarian','vegan','non_vegetarian','eggetarian','jain']),
]

router.use(requireAuth)

router.post  ('/',           profileRules, validate, upsertProfile)
router.put   ('/',           profileRules, validate, upsertProfile)
router.get   ('/',           getProfile)
router.get   ('/dashboard',  getDashboard)

router.post  ('/water',
  [body('amount_ml').optional().isInt({ min: 50, max: 2000 })],
  validate, logWater
)

router.post  ('/nutrition-log',
  [
    body('meal_slot').isIn(['breakfast','lunch','snack','dinner']),
    body('portion_g').isFloat({ min: 1, max: 3000 }),
  ],
  validate, logNutrition
)

module.exports = router
