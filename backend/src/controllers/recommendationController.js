const axios   = require('axios')
const { pool } = require('../config/db')
const { cacheGet, cacheSet, TTL } = require('../config/redis')
const { createError } = require('../middleware/errorHandler')
const { v4: uuidv4 }  = require('uuid')

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

// ─── Get Personalised Recommendations ────────────────────────────────────────
async function getRecommendations(req, res, next) {
  try {
    const userId   = req.user.id
    const cacheKey = `recommendations:${userId}`
    const cached   = await cacheGet(cacheKey)
    if (cached) return res.json({ success: true, data: cached, cached: true })

    // Fetch profile + recent interactions
    const [profiles] = await pool.query('SELECT * FROM health_profiles WHERE user_id = ?', [userId])
    if (!profiles.length) return next(createError(404, 'Profile required for recommendations'))

    const profile = profiles[0]

    // Recent interactions (last 30 days)
    const [interactions] = await pool.query(
      `SELECT recipe_id, action, value FROM user_interactions
       WHERE user_id = ? AND created_at >= datetime('now', '-30 days')`,
      [userId]
    )

    // Try ML service first, fall back to rule-based
    let recommendations = []
    try {
      const mlRes = await axios.post(
        `${ML_SERVICE_URL}/recommend`,
        { user_id: userId, profile, interactions },
        { timeout: 5000 }
      )
      recommendations = mlRes.data.recommendations || []
    } catch {
      // ML service down — use rule-based fallback
      recommendations = await ruleBasedRecommend(profile, interactions)
    }

    await cacheSet(cacheKey, recommendations, TTL.RECOMMENDATION)

    // Persist served recommendations
    const now = new Date()
    for (const rec of recommendations.slice(0, 10)) {
      await pool.query(
        'INSERT OR IGNORE INTO recommendations (id, user_id, recipe_id, score, reason, algorithm) VALUES (?,?,?,?,?,?)',
        [uuidv4(), userId, rec.id, rec.score || 0.5, rec.reason || null, rec.algorithm || 'rule_based']
      ).catch(() => {})
    }

    res.json({ success: true, data: recommendations })
  } catch (err) {
    next(err)
  }
}

// ─── Rule-based fallback (no ML service) ─────────────────────────────────────
async function ruleBasedRecommend(profile, interactions) {
  const conditions = profile.conditions || []
  const dietType   = profile.diet_type  || 'vegetarian'

  // Build health tag requirements from conditions
  const preferredTags = []
  if (conditions.includes('diabetes'))     preferredTags.push('Diabetic-Friendly')
  if (conditions.includes('anemia'))       preferredTags.push('Iron-Rich')
  if (conditions.includes('pcod'))         preferredTags.push('PCOD-Friendly')
  if (conditions.includes('hypertension')) preferredTags.push('Low-Sodium')
  if (conditions.includes('thyroid'))      preferredTags.push('Thyroid-Support')

  const alreadySeen = new Set(interactions.map((i) => i.recipe_id))

  let query = `SELECT id, name, image_url, food_emoji, calories, health_score, meal_type, diet_type, health_tags
               FROM recipes WHERE is_published = TRUE AND diet_type = ? AND health_score >= 60`
  const params = [dietType]

  if (alreadySeen.size > 0) {
    query += ` AND id NOT IN (${Array(alreadySeen.size).fill('?').join(',')})`
    params.push(...alreadySeen)
  }

  if (preferredTags.length) {
    const tagConditions = preferredTags.map(() => 'EXISTS (SELECT 1 FROM json_each(health_tags) WHERE value = ?)').join(' OR ')
    query += ` AND (${tagConditions})`
    preferredTags.forEach((t) => params.push(t))
  }

  query += ' ORDER BY health_score DESC LIMIT 12'

  const [rows] = await pool.query(query, params)
  return rows.map((r) => ({ ...r, score: (r.health_score || 50) / 100, algorithm: 'rule_based' }))
}

// ─── Track Interaction ────────────────────────────────────────────────────────
async function trackInteraction(req, res, next) {
  try {
    const { recipe_id, action, value } = req.body
    await pool.query(
      'INSERT INTO user_interactions (id, user_id, recipe_id, action, value) VALUES (?,?,?,?,?)',
      [uuidv4(), req.user.id, recipe_id, action, value || null]
    )
    // Mark recommendation as clicked if viewed
    if (action === 'view') {
      await pool.query(
        'UPDATE recommendations SET clicked = TRUE WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, recipe_id]
      )
    }
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { getRecommendations, trackInteraction }
