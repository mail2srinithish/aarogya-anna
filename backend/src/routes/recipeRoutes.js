const express  = require('express')
const { body, query } = require('express-validator')
const router   = express.Router()

const {
  listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe,
  toggleSave, rateRecipe, getSaved,
} = require('../controllers/recipeController')
const { requireAuth, optionalAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

const rateRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
]

const createRules = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name required (2–255 chars)'),
  body('diet_type').isIn(['vegetarian','vegan','non_vegetarian','eggetarian','jain']),
]

// Public list with optional auth for personalisation
router.get ('/',        optionalAuth, listRecipes)
router.get ('/saved',   requireAuth,  getSaved)
router.get ('/:id',     optionalAuth, getRecipe)

// Authenticated mutations
router.post('/',        requireAuth, createRules, validate, createRecipe)
router.put ('/:id',     requireAuth, updateRecipe)
router.delete('/:id',  requireAuth, deleteRecipe)
router.post('/:id/save',   requireAuth, toggleSave)
router.post('/:id/rate',   requireAuth, rateRules, validate, rateRecipe)

module.exports = router
