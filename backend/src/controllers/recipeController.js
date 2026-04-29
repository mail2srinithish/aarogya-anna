const { pool }    = require('../config/db')
const { cacheGet, cacheSet, cacheDel, cacheDelPattern, TTL } = require('../config/redis')
const { calcHealthScore } = require('../utils/healthScore')
const { createError }     = require('../middleware/errorHandler')
const { v4: uuidv4 }      = require('uuid')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFilterQuery(filters) {
  const conditions = ['r.is_published = TRUE']
  const params     = []

  if (filters.meal_type) {
    conditions.push('EXISTS (SELECT 1 FROM json_each(r.meal_type) WHERE value = ?)')
    params.push(filters.meal_type)
  }
  if (filters.diet_type) {
    conditions.push('r.diet_type = ?')
    params.push(filters.diet_type)
  }
  if (filters.region) {
    conditions.push('r.region LIKE ?')
    params.push(`%${filters.region}%`)
  }
  if (filters.category) {
    conditions.push('r.category = ?')
    params.push(filters.category)
  }
  if (filters.season) {
    conditions.push('EXISTS (SELECT 1 FROM json_each(r.season) WHERE value = ?)')
    params.push(filters.season)
  }
  if (filters.max_calories) {
    conditions.push('r.calories <= ?')
    params.push(parseFloat(filters.max_calories))
  }
  if (filters.min_calories) {
    conditions.push('r.calories >= ?')
    params.push(parseFloat(filters.min_calories))
  }
  if (filters.max_prep_time) {
    conditions.push('(r.prep_time_min + r.cook_time_min) <= ?')
    params.push(parseInt(filters.max_prep_time))
  }
  if (filters.health_tag) {
    conditions.push('EXISTS (SELECT 1 FROM json_each(r.health_tags) WHERE value = ?)')
    params.push(filters.health_tag)
  }
  if (filters.search) {
    conditions.push('(r.name LIKE ? OR r.name_regional LIKE ? OR r.description LIKE ?)')
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`)
  }

  return { where: conditions.join(' AND '), params }
}

const ALLOWED_SORT = {
  health_score: 'r.health_score DESC',
  calories:     'r.calories ASC',
  prep_time:    '(r.prep_time_min + COALESCE(r.cook_time_min,0)) ASC',
  rating:       'r.rating_avg DESC',
  popular:      'r.view_count DESC',
  newest:       'r.created_at DESC',
}

// ─── List Recipes (paginated, filtered) ──────────────────────────────────────
async function listRecipes(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '24')))
    const sort  = ALLOWED_SORT[req.query.sort] || ALLOWED_SORT.health_score
    const offset = (page - 1) * limit

    const { where, params } = buildFilterQuery(req.query)

    const cacheKey = `recipes:list:${JSON.stringify({ ...req.query, page, limit })}`
    const cached   = await cacheGet(cacheKey)
    if (cached) return res.json({ success: true, ...cached, cached: true })

    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.name_regional, r.image_url, r.food_emoji,
              r.meal_type, r.diet_type, r.region, r.category, r.season, r.festivals,
              r.prep_time_min, r.cook_time_min, r.difficulty, r.servings,
              r.calories, r.protein_g, r.carbs_g, r.fat_g, r.fiber_g,
              r.health_score, r.health_tags, r.rating_avg, r.rating_count, r.view_count,
              r.source, r.created_at
       FROM recipes r
       WHERE ${where}
       ORDER BY ${sort}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM recipes r WHERE ${where}`,
      params
    )

    const data = { data: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    await cacheSet(cacheKey, data, TTL.RECIPE_LIST)
    res.json({ success: true, ...data })
  } catch (err) {
    next(err)
  }
}

// ─── Get Single Recipe ────────────────────────────────────────────────────────
async function getRecipe(req, res, next) {
  try {
    const { id } = req.params
    const cacheKey = `recipe:${id}`
    const cached   = await cacheGet(cacheKey)
    if (cached) {
      // Async view increment (fire-and-forget)
      pool.query('UPDATE recipes SET view_count = view_count + 1 WHERE id = ?', [id]).catch(() => {})
      return res.json({ success: true, data: cached, cached: true })
    }

    const [rows] = await pool.query('SELECT * FROM recipes WHERE id = ? AND is_published = TRUE', [id])
    if (!rows.length) return next(createError(404, 'Recipe not found'))

    await pool.query('UPDATE recipes SET view_count = view_count + 1 WHERE id = ?', [id])

    // Similar recipes
    const recipe = rows[0]
    const [similar] = await pool.query(
      `SELECT id, name, image_url, food_emoji, calories, health_score, meal_type, diet_type
       FROM recipes
       WHERE id != ? AND diet_type = ? AND is_published = TRUE
       ORDER BY health_score DESC LIMIT 6`,
      [id, recipe.diet_type]
    )

    const data = { ...recipe, similar }
    await cacheSet(cacheKey, data, TTL.RECIPE)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

// ─── Create Recipe ────────────────────────────────────────────────────────────
async function createRecipe(req, res, next) {
  try {
    const id = uuidv4()
    const {
      name, name_regional, description, image_url, food_emoji,
      meal_type, diet_type, cuisine, region, category,
      season, festivals, ayurvedic_dosha,
      prep_time_min, cook_time_min, difficulty, servings,
      calories, protein_g, carbs_g, fat_g, fiber_g,
      sugar_g, sodium_mg, potassium_mg, calcium_mg, iron_mg,
      zinc_mg, magnesium_mg, phosphorus_mg, vitamin_a_mcg,
      vitamin_c_mg, vitamin_d_mcg, vitamin_b12_mcg, folate_mcg,
      omega3_g, omega6_g, saturated_fat_g, cholesterol_mg, glycemic_index,
      health_tags, ingredients, steps,
    } = req.body

    const nutrition = { fiber_g, protein_g, vitamin_c_mg, iron_mg, calcium_mg, saturated_fat_g, sugar_g, sodium_mg }
    const health_score = calcHealthScore(nutrition)

    await pool.query(
      `INSERT INTO recipes (
         id, name, name_regional, description, image_url, food_emoji,
         meal_type, diet_type, cuisine, region, category,
         season, festivals, ayurvedic_dosha,
         prep_time_min, cook_time_min, difficulty, servings,
         calories, protein_g, carbs_g, fat_g, fiber_g,
         sugar_g, sodium_mg, potassium_mg, calcium_mg, iron_mg,
         zinc_mg, magnesium_mg, phosphorus_mg, vitamin_a_mcg,
         vitamin_c_mg, vitamin_d_mcg, vitamin_b12_mcg, folate_mcg,
         omega3_g, omega6_g, saturated_fat_g, cholesterol_mg, glycemic_index,
         health_score, health_tags, ingredients, steps, created_by, source
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, name, name_regional || null, description || null, image_url || null, food_emoji || null,
        JSON.stringify(meal_type || []), diet_type, cuisine || null, region || null, category || null,
        JSON.stringify(season || []), JSON.stringify(festivals || []), ayurvedic_dosha || null,
        prep_time_min || null, cook_time_min || null, difficulty || 'easy', servings || 2,
        calories || null, protein_g || null, carbs_g || null, fat_g || null, fiber_g || null,
        sugar_g || null, sodium_mg || null, potassium_mg || null, calcium_mg || null, iron_mg || null,
        zinc_mg || null, magnesium_mg || null, phosphorus_mg || null, vitamin_a_mcg || null,
        vitamin_c_mg || null, vitamin_d_mcg || null, vitamin_b12_mcg || null, folate_mcg || null,
        omega3_g || null, omega6_g || null, saturated_fat_g || null, cholesterol_mg || null, glycemic_index || null,
        health_score,
        JSON.stringify(health_tags || []),
        JSON.stringify(ingredients || []),
        JSON.stringify(steps || []),
        req.user.id,
        'manual',
      ]
    )

    await cacheDelPattern('recipes:list:*')
    const [created] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id])
    res.status(201).json({ success: true, data: created[0] })
  } catch (err) {
    next(err)
  }
}

// ─── Update Recipe ────────────────────────────────────────────────────────────
async function updateRecipe(req, res, next) {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT id, created_by FROM recipes WHERE id = ?', [id])
    if (!rows.length) return next(createError(404, 'Recipe not found'))
    if (rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorised to edit this recipe'))
    }

    const allowed = [
      'name','name_regional','description','image_url','food_emoji',
      'meal_type','diet_type','cuisine','region','category',
      'season','festivals','prep_time_min','cook_time_min','difficulty','servings',
      'calories','protein_g','carbs_g','fat_g','fiber_g','sugar_g','sodium_mg',
      'health_tags','ingredients','steps','is_published',
    ]
    const updates = []
    const values  = []
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`)
        const v = req.body[field]
        values.push(Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v)
      }
    })
    if (!updates.length) return next(createError(400, 'No fields to update'))

    values.push(id)
    await pool.query(`UPDATE recipes SET ${updates.join(', ')} WHERE id = ?`, values)

    await cacheDel(`recipe:${id}`)
    await cacheDelPattern('recipes:list:*')

    const [updated] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id])
    res.json({ success: true, data: updated[0] })
  } catch (err) {
    next(err)
  }
}

// ─── Delete Recipe ────────────────────────────────────────────────────────────
async function deleteRecipe(req, res, next) {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT id, created_by FROM recipes WHERE id = ?', [id])
    if (!rows.length) return next(createError(404, 'Recipe not found'))
    if (rows[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return next(createError(403, 'Not authorised'))
    }

    await pool.query('DELETE FROM recipes WHERE id = ?', [id])
    await cacheDel(`recipe:${id}`)
    await cacheDelPattern('recipes:list:*')

    res.json({ success: true, message: 'Recipe deleted' })
  } catch (err) {
    next(err)
  }
}

// ─── Save / Unsave Recipe ─────────────────────────────────────────────────────
async function toggleSave(req, res, next) {
  try {
    const { id: recipe_id } = req.params
    const user_id = req.user.id

    const [existing] = await pool.query(
      'SELECT id FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
      [user_id, recipe_id]
    )

    if (existing.length) {
      await pool.query('DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?', [user_id, recipe_id])
      return res.json({ success: true, saved: false })
    }

    await pool.query(
      'INSERT INTO saved_recipes (id, user_id, recipe_id) VALUES (?, ?, ?)',
      [uuidv4(), user_id, recipe_id]
    )
    res.json({ success: true, saved: true })
  } catch (err) {
    next(err)
  }
}

// ─── Rate Recipe ──────────────────────────────────────────────────────────────
async function rateRecipe(req, res, next) {
  try {
    const { id: recipe_id } = req.params
    const { rating, review } = req.body
    const user_id = req.user.id

    await pool.query(
      `INSERT INTO recipe_ratings (id, user_id, recipe_id, rating, review)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, recipe_id) DO UPDATE SET rating = excluded.rating, review = excluded.review`,
      [uuidv4(), user_id, recipe_id, rating, review || null]
    )

    // Recalculate avg
    const [[avg]] = await pool.query(
      'SELECT AVG(rating) AS avg, COUNT(*) AS cnt FROM recipe_ratings WHERE recipe_id = ?',
      [recipe_id]
    )
    await pool.query(
      'UPDATE recipes SET rating_avg = ?, rating_count = ? WHERE id = ?',
      [Math.round(avg.avg * 100) / 100, avg.cnt, recipe_id]
    )

    await cacheDel(`recipe:${recipe_id}`)
    res.json({ success: true, rating_avg: avg.avg, rating_count: avg.cnt })
  } catch (err) {
    next(err)
  }
}

// ─── Get Saved Recipes ────────────────────────────────────────────────────────
async function getSaved(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.image_url, r.food_emoji, r.calories,
              r.health_score, r.meal_type, r.diet_type, r.health_tags
       FROM saved_recipes sr
       JOIN recipes r ON r.id = sr.recipe_id
       WHERE sr.user_id = ?
       ORDER BY sr.created_at DESC`,
      [req.user.id]
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe,
  toggleSave, rateRecipe, getSaved,
}
