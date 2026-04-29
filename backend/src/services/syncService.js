/**
 * Data Sync Service
 * Pulls recipes from TheMealDB (free) and nutrition data from USDA FoodData Central
 * Runs via cron (see jobs/dailySync.js) or manual admin trigger
 */
const axios   = require('axios')
const { v4: uuidv4 }  = require('uuid')
const { pool }        = require('../config/db')
const { cacheDelPattern } = require('../config/redis')
const { calcHealthScore } = require('../utils/healthScore')

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1'
const USDA_BASE   = 'https://api.nal.usda.gov/fdc/v1'

// Indian cuisine categories to sync from TheMealDB
const INDIAN_CATEGORIES = ['Indian']

async function logSync(source, status, added = 0, updated = 0, error = null) {
  const id = uuidv4()
  await pool.query(
    `INSERT INTO sync_logs (id, source, status, records_added, records_updated, error_message, started_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ${status !== 'started' ? "datetime('now')" : 'NULL'})`,
    [id, source, status, added, updated, error]
  ).catch(() => {})
  return id
}

// ─── Sync TheMealDB ───────────────────────────────────────────────────────────
async function syncMealDB() {
  const logId = await logSync('mealdb', 'started')
  let added = 0, updated = 0

  try {
    for (const category of INDIAN_CATEGORIES) {
      // List all meals in category
      const listRes = await axios.get(`${MEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`, { timeout: 10000 })
      const meals   = listRes.data?.meals || []

      for (const meal of meals) {
        try {
          // Full details
          const detailRes = await axios.get(`${MEALDB_BASE}/lookup.php?i=${meal.idMeal}`, { timeout: 10000 })
          const m = detailRes.data?.meals?.[0]
          if (!m) continue

          // Build ingredients JSON
          const ingredients = []
          for (let i = 1; i <= 20; i++) {
            const ing = m[`strIngredient${i}`]?.trim()
            const msr = m[`strMeasure${i}`]?.trim()
            if (ing) ingredients.push({ name: ing, measure: msr || '' })
          }

          // Build steps JSON
          const stepsRaw = (m.strInstructions || '').split(/\r?\n/).filter((s) => s.trim().length > 5)
          const steps = stepsRaw.map((s, i) => ({ step: i + 1, instruction: s.trim() }))

          const existingCheck = await pool.query(
            'SELECT id FROM recipes WHERE external_id = ? AND source = ?',
            [m.idMeal, 'mealdb']
          )

          if (existingCheck[0].length) {
            await pool.query(
              "UPDATE recipes SET name=?, image_url=?, ingredients=?, steps=?, cuisine=?, updated_at=datetime('now') WHERE external_id=? AND source=?",
              [m.strMeal, m.strMealThumb, JSON.stringify(ingredients), JSON.stringify(steps), m.strArea || 'Indian', m.idMeal, 'mealdb']
            )
            updated++
          } else {
            const id = uuidv4()
            await pool.query(
              `INSERT INTO recipes (id, external_id, source, name, image_url, cuisine, region,
                meal_type, diet_type, ingredients, steps, is_published, health_score)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,TRUE,50)`,
              [id, m.idMeal, 'mealdb', m.strMeal, m.strMealThumb,
               m.strArea || 'Indian', 'Indian',
               JSON.stringify(['lunch','dinner']),
               'non_vegetarian',
               JSON.stringify(ingredients),
               JSON.stringify(steps)]
            )
            added++
          }
        } catch (itemErr) {
          console.warn(`MealDB item sync error (${meal.idMeal}):`, itemErr.message)
        }
        // Throttle to respect free API
        await new Promise((r) => setTimeout(r, 300))
      }
    }

    // Update system config
    await pool.query(
      "UPDATE system_config SET value = datetime('now') WHERE key_name = ?",
      ['last_mealdb_sync']
    ).catch(() => {})

    await cacheDelPattern('recipes:list:*')
    await logSync('mealdb', 'success', added, updated)
    console.log(`✅ MealDB sync complete — added: ${added}, updated: ${updated}`)
  } catch (err) {
    await logSync('mealdb', 'failed', added, updated, err.message)
    console.error('❌ MealDB sync failed:', err.message)
  }
}

// ─── Sync USDA FoodData Central ───────────────────────────────────────────────
async function syncUSDA() {
  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) {
    console.warn('⚠️  USDA_API_KEY not set — skipping USDA sync')
    return
  }

  const logId = await logSync('usda', 'started')
  let added = 0, updated = 0

  // Indian food queries to pull from USDA
  const queries = [
    'lentil', 'chickpea', 'mung bean', 'toor dal', 'urad dal',
    'ragi', 'jowar', 'bajra', 'amaranth', 'moringa',
    'amla', 'drumstick', 'bitter gourd', 'curry leaf',
    'sesame seed', 'flaxseed', 'pumpkin seed',
  ]

  try {
    for (const q of queries) {
      try {
        const res = await axios.get(`${USDA_BASE}/foods/search`, {
          params: { query: q, api_key: apiKey, pageSize: 5, dataType: 'SR Legacy,Foundation' },
          timeout: 10000,
        })

        const foods = res.data?.foods || []
        for (const food of foods) {
          const nutrients = {}
          ;(food.foodNutrients || []).forEach((n) => {
            const map = {
              1008: 'calories',     208: 'calories',
              1003: 'protein_g',    203: 'protein_g',
              1005: 'carbs_g',      205: 'carbs_g',
              1004: 'fat_g',        204: 'fat_g',
              1079: 'fiber_g',      291: 'fiber_g',
              1087: 'calcium_mg',   301: 'calcium_mg',
              1089: 'iron_mg',      303: 'iron_mg',
              1093: 'sodium_mg',    307: 'sodium_mg',
              1098: 'zinc_mg',      309: 'zinc_mg',
              1092: 'potassium_mg', 306: 'potassium_mg',
              1162: 'vitamin_c_mg', 401: 'vitamin_c_mg',
              1114: 'vitamin_d_mcg',328: 'vitamin_d_mcg',
              1178: 'vitamin_b12_mcg', 418: 'vitamin_b12_mcg',
              1177: 'folate_mcg',   435: 'folate_mcg',
              1087: 'magnesium_mg', 304: 'magnesium_mg',
            }
            const key = map[n.nutrientId]
            if (key) nutrients[key] = Math.round((n.value || 0) * 10) / 10
          })

          const healthScore = calcHealthScore(nutrients)
          const externalId  = `usda_${food.fdcId}`

          const [existing] = await pool.query(
            'SELECT id FROM recipes WHERE external_id = ?',
            [externalId]
          )

          if (existing.length) {
            await pool.query(
              `UPDATE recipes SET calories=?, protein_g=?, carbs_g=?, fat_g=?, fiber_g=?,
               calcium_mg=?, iron_mg=?, sodium_mg=?, zinc_mg=?, potassium_mg=?,
               vitamin_c_mg=?, vitamin_d_mcg=?, vitamin_b12_mcg=?, folate_mcg=?,
               health_score=?, updated_at=datetime('now') WHERE external_id=?`,
              [nutrients.calories, nutrients.protein_g, nutrients.carbs_g, nutrients.fat_g, nutrients.fiber_g,
               nutrients.calcium_mg, nutrients.iron_mg, nutrients.sodium_mg, nutrients.zinc_mg, nutrients.potassium_mg,
               nutrients.vitamin_c_mg, nutrients.vitamin_d_mcg, nutrients.vitamin_b12_mcg, nutrients.folate_mcg,
               healthScore, externalId]
            )
            updated++
          } else {
            const id = uuidv4()
            await pool.query(
              `INSERT INTO recipes (id, external_id, source, name, category,
                meal_type, diet_type, is_published,
                calories, protein_g, carbs_g, fat_g, fiber_g,
                calcium_mg, iron_mg, sodium_mg, zinc_mg, potassium_mg,
                vitamin_c_mg, vitamin_d_mcg, vitamin_b12_mcg, folate_mcg, health_score)
               VALUES (?,?,?,?,?,?,?,TRUE,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [id, externalId, 'usda', food.description, 'food_item',
               JSON.stringify(['any']), 'vegetarian',
               nutrients.calories, nutrients.protein_g, nutrients.carbs_g, nutrients.fat_g, nutrients.fiber_g,
               nutrients.calcium_mg, nutrients.iron_mg, nutrients.sodium_mg, nutrients.zinc_mg, nutrients.potassium_mg,
               nutrients.vitamin_c_mg, nutrients.vitamin_d_mcg, nutrients.vitamin_b12_mcg, nutrients.folate_mcg, healthScore]
            )
            added++
          }
        }
      } catch (queryErr) {
        console.warn(`USDA query error (${q}):`, queryErr.message)
      }
      await new Promise((r) => setTimeout(r, 500))
    }

    await pool.query(
      "UPDATE system_config SET value = datetime('now') WHERE key_name = ?",
      ['last_usda_sync']
    ).catch(() => {})

    await cacheDelPattern('recipes:list:*')
    await logSync('usda', 'success', added, updated)
    console.log(`✅ USDA sync complete — added: ${added}, updated: ${updated}`)
  } catch (err) {
    await logSync('usda', 'failed', added, updated, err.message)
    console.error('❌ USDA sync failed:', err.message)
  }
}

// ─── Main run function ────────────────────────────────────────────────────────
async function runSync(source = 'all') {
  if (source === 'mealdb' || source === 'all') await syncMealDB()
  if (source === 'usda'   || source === 'all') await syncUSDA()
}

module.exports = { runSync, syncMealDB, syncUSDA }
