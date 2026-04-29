const { pool }      = require('../config/db')
const { cacheGet, cacheSet, cacheDel, TTL } = require('../config/redis')
const { calcBMR, calcTDEE, idealWeightRange, calcBMI } = require('../utils/bmi')
const { createError } = require('../middleware/errorHandler')

// ─── Setup / Update Profile ──────────────────────────────────────────────────
async function upsertProfile(req, res, next) {
  try {
    const userId = req.user.id
    const {
      age, gender, weight_kg, height_cm,
      activity_level, diet_type, region, language,
      conditions, allergies, health_goal,
    } = req.body

    const bmr  = calcBMR(age, gender, weight_kg, height_cm)
    const tdee = calcTDEE(bmr, activity_level)

    const [existing] = await pool.query('SELECT id FROM health_profiles WHERE user_id = ?', [userId])

    if (existing.length) {
      await pool.query(
        `UPDATE health_profiles SET
          age=?, gender=?, weight_kg=?, height_cm=?,
          bmr=?, tdee=?, activity_level=?, diet_type=?,
          region=?, language=?, conditions=?, allergies=?, health_goal=?
         WHERE user_id=?`,
        [age, gender, weight_kg, height_cm,
         bmr, tdee, activity_level, diet_type,
         region, language,
         JSON.stringify(conditions || []),
         JSON.stringify(allergies  || []),
         health_goal, userId]
      )
    } else {
      const { v4: uuidv4 } = require('uuid')
      await pool.query(
        `INSERT INTO health_profiles
          (id, user_id, age, gender, weight_kg, height_cm, bmr, tdee,
           activity_level, diet_type, region, language, conditions, allergies, health_goal)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [uuidv4(), userId, age, gender, weight_kg, height_cm, bmr, tdee,
         activity_level, diet_type, region, language,
         JSON.stringify(conditions || []),
         JSON.stringify(allergies  || []),
         health_goal]
      )
    }

    // Clear caches
    await cacheDel(`profile:${userId}`)
    await cacheDel(`dashboard:${userId}`)

    const [profile] = await pool.query('SELECT * FROM health_profiles WHERE user_id = ?', [userId])
    const bmi = calcBMI(weight_kg, height_cm)
    const ideal = idealWeightRange(height_cm, gender)

    res.json({
      success: true,
      message: 'Profile saved',
      data: { ...profile[0], bmi, ideal_weight: ideal, bmr, tdee },
    })
  } catch (err) {
    next(err)
  }
}

// ─── Get Profile ─────────────────────────────────────────────────────────────
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id
    const cached = await cacheGet(`profile:${userId}`)
    if (cached) return res.json({ success: true, data: cached, cached: true })

    const [rows] = await pool.query('SELECT * FROM health_profiles WHERE user_id = ?', [userId])
    if (!rows.length) return next(createError(404, 'Profile not set up yet'))

    const p = rows[0]
    const ideal = idealWeightRange(p.height_cm, p.gender)
    const data  = { ...p, ideal_weight: ideal }

    await cacheSet(`profile:${userId}`, data, TTL.PROFILE)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────
async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id
    const cached = await cacheGet(`dashboard:${userId}`)
    if (cached) return res.json({ success: true, data: cached, cached: true })

    // Profile
    const [profiles] = await pool.query('SELECT * FROM health_profiles WHERE user_id = ?', [userId])
    if (!profiles.length) return next(createError(404, 'Profile not found'))
    const profile = profiles[0]

    const today = new Date().toISOString().slice(0, 10)

    // Today's nutrition totals
    const [todayLogs] = await pool.query(
      `SELECT
         COALESCE(SUM(calories),0)     AS calories,
         COALESCE(SUM(protein_g),0)    AS protein_g,
         COALESCE(SUM(carbs_g),0)      AS carbs_g,
         COALESCE(SUM(fat_g),0)        AS fat_g,
         COALESCE(SUM(fiber_g),0)      AS fiber_g,
         COALESCE(SUM(iron_mg),0)      AS iron_mg,
         COALESCE(SUM(calcium_mg),0)   AS calcium_mg,
         COALESCE(SUM(vitamin_c_mg),0) AS vitamin_c_mg
       FROM nutrition_logs WHERE user_id = ? AND log_date = ?`,
      [userId, today]
    )

    // Water today
    const [waterRows] = await pool.query(
      'SELECT COALESCE(SUM(amount_ml),0) AS total_ml FROM water_logs WHERE user_id = ? AND log_date = ?',
      [userId, today]
    )

    // Last 7 days calories
    const [weekCalories] = await pool.query(
      `SELECT log_date, COALESCE(SUM(calories),0) AS calories
       FROM nutrition_logs WHERE user_id = ? AND log_date >= date('now', '-6 days')
       GROUP BY log_date ORDER BY log_date ASC`,
      [userId]
    )

    // Recent notifications (unread)
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC LIMIT 5',
      [userId]
    )

    // Recommended recipes (latest)
    const [recommendations] = await pool.query(
      `SELECT r.id, r.name, r.image_url, r.food_emoji, r.calories, r.health_score,
              r.meal_type, r.diet_type, r.health_tags, rec.score
       FROM recommendations rec
       JOIN recipes r ON r.id = rec.recipe_id
       WHERE rec.user_id = ?
       ORDER BY rec.score DESC, rec.served_at DESC LIMIT 6`,
      [userId]
    )

    const data = {
      profile,
      today_nutrition: todayLogs[0],
      water_ml:        waterRows[0].total_ml,
      week_calories:   weekCalories,
      notifications,
      recommendations,
    }

    await cacheSet(`dashboard:${userId}`, data, TTL.DASHBOARD)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// ─── Log Water ────────────────────────────────────────────────────────────────
async function logWater(req, res, next) {
  try {
    const { amount_ml = 250 } = req.body
    const { v4: uuidv4 } = require('uuid')
    const today = new Date().toISOString().slice(0, 10)

    await pool.query(
      'INSERT INTO water_logs (id, user_id, log_date, amount_ml) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, today, amount_ml]
    )
    await cacheDel(`dashboard:${req.user.id}`)

    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(amount_ml),0) AS total_ml FROM water_logs WHERE user_id = ? AND log_date = ?',
      [req.user.id, today]
    )
    res.json({ success: true, data: { total_ml: rows[0].total_ml } })
  } catch (err) {
    next(err)
  }
}

// ─── Log Nutrition (food/recipe eaten) ───────────────────────────────────────
async function logNutrition(req, res, next) {
  try {
    const { recipe_id, custom_name, portion_g, meal_slot } = req.body
    const today = new Date().toISOString().slice(0, 10)
    const { v4: uuidv4 } = require('uuid')

    let nutrition = {}
    if (recipe_id) {
      const [rows] = await pool.query(
        'SELECT calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg FROM recipes WHERE id = ?',
        [recipe_id]
      )
      if (rows.length) {
        const factor = portion_g / 100
        const r = rows[0]
        nutrition = {
          calories:     Math.round((r.calories     || 0) * factor * 10) / 10,
          protein_g:    Math.round((r.protein_g    || 0) * factor * 10) / 10,
          carbs_g:      Math.round((r.carbs_g      || 0) * factor * 10) / 10,
          fat_g:        Math.round((r.fat_g        || 0) * factor * 10) / 10,
          fiber_g:      Math.round((r.fiber_g      || 0) * factor * 10) / 10,
          iron_mg:      Math.round((r.iron_mg      || 0) * factor * 10) / 10,
          calcium_mg:   Math.round((r.calcium_mg   || 0) * factor * 10) / 10,
          vitamin_c_mg: Math.round((r.vitamin_c_mg || 0) * factor * 10) / 10,
        }
      }
    }

    await pool.query(
      `INSERT INTO nutrition_logs
        (id, user_id, log_date, meal_slot, recipe_id, custom_name, portion_g,
         calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [uuidv4(), req.user.id, today, meal_slot, recipe_id || null, custom_name || null,
       portion_g, nutrition.calories || 0, nutrition.protein_g || 0,
       nutrition.carbs_g || 0, nutrition.fat_g || 0, nutrition.fiber_g || 0,
       nutrition.iron_mg || 0, nutrition.calcium_mg || 0, nutrition.vitamin_c_mg || 0]
    )

    await cacheDel(`dashboard:${req.user.id}`)
    res.status(201).json({ success: true, message: 'Logged' })
  } catch (err) {
    next(err)
  }
}

module.exports = { upsertProfile, getProfile, getDashboard, logWater, logNutrition }
