/**
 * USDA FoodData Central API Service
 * Free API — demo key works at 30 req/hour, 50/day (sufficient for search)
 * Real key: set VITE_USDA_API_KEY in .env for higher limits
 * Docs: https://fdc.nal.usda.gov/api-guide.html
 */

const USDA_BASE  = 'https://api.nal.usda.gov/fdc/v1'
const USDA_KEY   = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY'

// USDA nutrient IDs → AarogyaAnna field names
const NUTRIENT_MAP = {
  1008: 'calories',        // Energy (kcal)
  1003: 'protein_g',       // Protein
  1005: 'carbs_g',         // Carbohydrate
  1004: 'fat_g',           // Total Fat
  1079: 'fiber_g',         // Fiber
  2000: 'sugar_g',         // Total Sugars
  1258: 'saturated_fat_g', // Saturated Fat
  1257: 'trans_fat_g',     // Trans Fat
  1093: 'sodium_mg',       // Sodium
  1092: 'potassium_mg',    // Potassium
  1087: 'calcium_mg',      // Calcium
  1089: 'iron_mg',         // Iron
  1090: 'magnesium_mg',    // Magnesium
  1095: 'zinc_mg',         // Zinc
  1091: 'phosphorus_mg',   // Phosphorus
  1106: 'vitamin_a_mcg',   // Vitamin A
  1162: 'vitamin_c_mg',    // Vitamin C
  1114: 'vitamin_d_mcg',   // Vitamin D
  1178: 'vitamin_b12_mcg', // Vitamin B12
  1177: 'folate_mcg',      // Folate
  1185: 'vitamin_k_mcg',   // Vitamin K
  1253: 'cholesterol_mg',  // Cholesterol
}

function extractNutritionFromUSDA(foodNutrients = []) {
  const n = {}
  for (const fn of foodNutrients) {
    const key = NUTRIENT_MAP[fn.nutrientId || fn.number]
    if (key && fn.value != null) {
      n[key] = parseFloat(fn.value) || 0
    }
  }
  // Ensure calories from macros if missing
  if (!n.calories && (n.protein_g || n.carbs_g || n.fat_g)) {
    n.calories = Math.round((n.protein_g || 0) * 4 + (n.carbs_g || 0) * 4 + (n.fat_g || 0) * 9)
  }
  return {
    calories:         Math.round(n.calories || 0),
    protein_g:        Math.round((n.protein_g || 0) * 10) / 10,
    carbs_g:          Math.round((n.carbs_g || 0) * 10) / 10,
    fat_g:            Math.round((n.fat_g || 0) * 10) / 10,
    fiber_g:          Math.round((n.fiber_g || 0) * 10) / 10,
    sugar_g:          Math.round((n.sugar_g || 0) * 10) / 10,
    saturated_fat_g:  Math.round((n.saturated_fat_g || 0) * 10) / 10,
    trans_fat_g:      Math.round((n.trans_fat_g || 0) * 10) / 10,
    sodium_mg:        Math.round(n.sodium_mg || 0),
    potassium_mg:     Math.round(n.potassium_mg || 0),
    calcium_mg:       Math.round(n.calcium_mg || 0),
    iron_mg:          Math.round((n.iron_mg || 0) * 100) / 100,
    magnesium_mg:     Math.round(n.magnesium_mg || 0),
    zinc_mg:          Math.round((n.zinc_mg || 0) * 100) / 100,
    phosphorus_mg:    Math.round(n.phosphorus_mg || 0),
    vitamin_a_mcg:    Math.round(n.vitamin_a_mcg || 0),
    vitamin_c_mg:     Math.round((n.vitamin_c_mg || 0) * 10) / 10,
    vitamin_d_mcg:    Math.round((n.vitamin_d_mcg || 0) * 10) / 10,
    vitamin_b12_mcg:  Math.round((n.vitamin_b12_mcg || 0) * 100) / 100,
    folate_mcg:       Math.round(n.folate_mcg || 0),
    cholesterol_mg:   Math.round(n.cholesterol_mg || 0),
    omega3_g:         0,
    glycemic_index:   55,
    serving_size_g:   100,
  }
}

function calcHealthScore(n) {
  return Math.min(100, Math.round(
    (Math.min((n.fiber_g || 0) / 28, 1) * 20) +
    (Math.min((n.protein_g || 0) / 50, 1) * 20) +
    (Math.max(0, 1 - (n.sugar_g || 0) / 50) * 20) +
    (Math.max(0, 1 - (n.saturated_fat_g || 0) / 20) * 20) +
    (Math.max(0, 1 - (n.sodium_mg || 0) / 2300) * 20)
  ))
}

// Guess health tags from nutrition
function guessHealthTags(n) {
  const tags = []
  if ((n.protein_g || 0) > 15)      tags.push('High-Protein')
  if ((n.fiber_g  || 0) > 5)        tags.push('High-Fiber')
  if ((n.iron_mg  || 0) > 3)        tags.push('Iron-Rich')
  if ((n.calcium_mg || 0) > 200)    tags.push('Calcium-Rich')
  if ((n.fat_g    || 0) < 3)        tags.push('Low-Fat')
  if ((n.sodium_mg || 0) < 140)     tags.push('Low-Sodium')
  if ((n.vitamin_c_mg || 0) > 30)   tags.push('Immune-Boost')
  return tags
}

export function transformUSDAFood(food) {
  if (!food?.description) return null

  const nutrition = extractNutritionFromUSDA(food.foodNutrients || [])
  const hs = calcHealthScore(nutrition)
  const name = food.description

  return {
    id:             `usda_${food.fdcId}`,
    name,
    name_regional:  name,
    category:       (food.foodCategory || 'food').toLowerCase().replace(/\s+/g, '_'),
    food_emoji:     '🥗',
    source:         'food_item',
    description:    food.additionalDescriptions || food.description || '',
    image_url:      null,
    meal_type:      ['lunch', 'dinner'],
    diet_type:      ['vegetarian'],
    region:         'india',
    state:          'India',
    cuisine_tags:   ['indian', 'usda'],
    health_tags:    guessHealthTags(nutrition),
    ayurveda_type:  'sattvic',
    season_tags:    ['all-year'],
    festival_tags:  [],
    health_score:   hs,
    rating:         4.0 + Math.random() * 0.8,
    reviews:        Math.floor(50 + Math.random() * 300),
    prep_time_mins: 0,
    cook_time_mins: 0,
    servings:       1,
    steps:          [],
    ingredients:    [],
    nutrition,
  }
}

export async function searchUSDA(query, page = 1, pageSize = 25) {
  if (!query?.trim()) return { items: [], total: 0, hasMore: false }

  try {
    const res = await fetch(
      `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&pageNumber=${page}&api_key=${USDA_KEY}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) throw new Error(`USDA search failed: ${res.status}`)
    const data = await res.json()
    const items = (data.foods || [])
      .map(transformUSDAFood)
      .filter(Boolean)

    return {
      items,
      total:   data.totalHits || 0,
      hasMore: page * pageSize < (data.totalHits || 0),
    }
  } catch (err) {
    console.warn('[USDA] search error:', err.message)
    return { items: [], total: 0, hasMore: false }
  }
}
