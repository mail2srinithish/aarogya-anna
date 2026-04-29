/**
 * TheMealDB API Service — Indian Recipes
 * Free tier: no API key required
 * Docs: https://www.themealdb.com/api.php
 */

const BASE = 'https://www.themealdb.com/api/json/v1/1'

// ─── Nutrition templates by TheMealDB category ─────────────────────────────
const NUTRITION_TEMPLATES = {
  Lamb:          { calories: 380, protein_g: 28, carbs_g: 22, fat_g: 18, fiber_g: 3, sugar_g: 5, sodium_mg: 520, iron_mg: 3.5, zinc_mg: 5 },
  Chicken:       { calories: 320, protein_g: 32, carbs_g: 18, fat_g: 12, fiber_g: 2, sugar_g: 4, sodium_mg: 480, iron_mg: 2.5, zinc_mg: 3 },
  Beef:          { calories: 420, protein_g: 30, carbs_g: 20, fat_g: 22, fiber_g: 2, sugar_g: 4, sodium_mg: 540, iron_mg: 4, zinc_mg: 6 },
  Seafood:       { calories: 280, protein_g: 30, carbs_g: 15, fat_g: 8,  fiber_g: 2, sugar_g: 3, sodium_mg: 420, omega3_g: 1.2, dha_mg: 350 },
  Vegetarian:    { calories: 220, protein_g: 12, carbs_g: 32, fat_g: 8,  fiber_g: 7, sugar_g: 6, sodium_mg: 380, iron_mg: 3, calcium_mg: 120 },
  Vegan:         { calories: 190, protein_g: 9,  carbs_g: 30, fat_g: 6,  fiber_g: 9, sugar_g: 5, sodium_mg: 320, iron_mg: 2.8, calcium_mg: 95 },
  Miscellaneous: { calories: 260, protein_g: 15, carbs_g: 28, fat_g: 10, fiber_g: 5, sugar_g: 7, sodium_mg: 400 },
  Dessert:       { calories: 320, protein_g: 5,  carbs_g: 55, fat_g: 12, fiber_g: 2, sugar_g: 38, sodium_mg: 120, calcium_mg: 150 },
  Side:          { calories: 180, protein_g: 8,  carbs_g: 25, fat_g: 6,  fiber_g: 5, sugar_g: 4, sodium_mg: 340, iron_mg: 2.5 },
  Starter:       { calories: 210, protein_g: 10, carbs_g: 22, fat_g: 10, fiber_g: 3, sugar_g: 4, sodium_mg: 350 },
  Pasta:         { calories: 380, protein_g: 14, carbs_g: 58, fat_g: 10, fiber_g: 3, sugar_g: 5, sodium_mg: 480 },
  default:       { calories: 280, protein_g: 14, carbs_g: 32, fat_g: 10, fiber_g: 4, sugar_g: 6, sodium_mg: 420 },
}

const DIET_TYPE_MAP = {
  Lamb:          ['non-vegetarian'],
  Chicken:       ['non-vegetarian'],
  Beef:          ['non-vegetarian'],
  Pork:          ['non-vegetarian'],
  Seafood:       ['non-vegetarian'],
  Goat:          ['non-vegetarian'],
  Mutton:        ['non-vegetarian'],
  Vegetarian:    ['vegetarian'],
  Vegan:         ['vegetarian', 'vegan'],
  Dessert:       ['vegetarian'],
  Side:          ['vegetarian'],
  Miscellaneous: ['vegetarian'],
  default:       ['vegetarian'],
}

const MEAL_TYPE_MAP = {
  Breakfast: 'breakfast',
  Dessert:   'dessert',
  Side:      'snack',
  Starter:   'snack',
  default:   'dinner',
}

const HEALTH_TAGS_MAP = {
  Vegetarian: ['High-Fiber', 'Low-Cholesterol', 'Gut-Health'],
  Vegan:      ['High-Fiber', 'Low-Cholesterol', 'Anti-Inflammatory'],
  Seafood:    ['High-Protein', 'Omega-3-Rich', 'Heart-Healthy', 'Brain-Health'],
  Chicken:    ['High-Protein', 'Low-Fat'],
  Lamb:       ['High-Protein', 'Iron-Rich', 'Zinc-Rich'],
  Dessert:    ['Energy-Dense'],
  default:    ['Traditional'],
}

// ─── Transform TheMealDB meal → AarogyaAnna recipe format ─────────────────
export function transformMeal(meal) {
  const category = meal.strCategory || 'default'
  const nutrition = {
    ...(NUTRITION_TEMPLATES[category] || NUTRITION_TEMPLATES.default),
    // Add full macro/micro defaults
    saturated_fat_g: Math.round(((NUTRITION_TEMPLATES[category] || NUTRITION_TEMPLATES.default).fat_g || 10) * 0.3 * 10) / 10,
    trans_fat_g: 0,
    cholesterol_mg: DIET_TYPE_MAP[category]?.[0] === 'non-vegetarian' ? 85 : 12,
    potassium_mg: 380,
    calcium_mg: (NUTRITION_TEMPLATES[category] || NUTRITION_TEMPLATES.default).calcium_mg || 80,
    magnesium_mg: 55,
    zinc_mg: (NUTRITION_TEMPLATES[category] || NUTRITION_TEMPLATES.default).zinc_mg || 2,
    phosphorus_mg: 180,
    vitamin_a_mcg: 120,
    vitamin_c_mg: 18,
    vitamin_d_mcg: DIET_TYPE_MAP[category]?.[0] === 'non-vegetarian' ? 2.5 : 0.5,
    vitamin_b12_mcg: DIET_TYPE_MAP[category]?.[0] === 'non-vegetarian' ? 1.8 : 0.1,
    folate_mcg: 55,
    iodine_mcg: 42,
    selenium_mcg: 18,
    omega3_g: (NUTRITION_TEMPLATES[category] || NUTRITION_TEMPLATES.default).omega3_g || 0.2,
    dha_mg: (NUTRITION_TEMPLATES[category] || NUTRITION_TEMPLATES.default).dha_mg || 30,
    glycemic_index: DIET_TYPE_MAP[category]?.[0] === 'vegetarian' ? 52 : 48,
    serving_size_g: 250,
  }

  // Extract ingredients (up to 20 slots in TheMealDB)
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim()
    const measure = meal[`strMeasure${i}`]?.trim()
    if (name) ingredients.push({ name, quantity: measure || '', unit: '' })
  }

  // Convert instructions to steps
  const steps = (meal.strInstructions || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .slice(0, 10)
    .map((instruction, idx) => ({ step: idx + 1, instruction, time_mins: 5 }))

  // Calculate a mock health score
  const n = nutrition
  const healthScore = Math.min(100, Math.round(
    (Math.min(n.fiber_g / 28, 1) * 20) +
    (Math.min(n.protein_g / 50, 1) * 25) +
    (Math.max(0, 1 - n.sugar_g / 50) * 20) +
    (Math.max(0, 1 - n.saturated_fat_g / 20) * 15) +
    (Math.min((n.iron_mg + n.vitamin_c_mg * 0.1) / 20, 1) * 20)
  ))

  return {
    id: `mdb_${meal.idMeal}`,
    name: meal.strMeal,
    name_regional: meal.strMeal,
    description: `A traditional Indian ${category.toLowerCase()} dish from TheMealDB.`,
    image_url: meal.strMealThumb,
    prep_time_mins: 20,
    cook_time_mins: 30,
    servings: 4,
    meal_type: MEAL_TYPE_MAP[category] || MEAL_TYPE_MAP.default,
    diet_type: DIET_TYPE_MAP[category] || DIET_TYPE_MAP.default,
    region: 'south',
    state: 'India',
    cuisine_tags: ['indian', category.toLowerCase()],
    health_tags: HEALTH_TAGS_MAP[category] || HEALTH_TAGS_MAP.default,
    ayurveda_type: 'sattvic',
    season_tags: ['all-year'],
    festival_tags: [],
    health_score: healthScore,
    rating: 3.8 + Math.random() * 1.2,
    reviews: Math.floor(100 + Math.random() * 900),
    nutrition,
    ingredients,
    steps,
    source: 'themealdb',
  }
}

// ─── Fetch list of Indian area meals (idMeal, strMeal, strMealThumb) ────────
export async function fetchIndianMealList() {
  const res = await fetch(`${BASE}/filter.php?a=Indian`)
  if (!res.ok) throw new Error('TheMealDB list fetch failed')
  const data = await res.json()
  return data.meals || []
}

// ─── Fetch full meal details by ID ──────────────────────────────────────────
export async function fetchMealById(id) {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`)
  if (!res.ok) throw new Error(`TheMealDB lookup failed for id=${id}`)
  const data = await res.json()
  return data.meals?.[0] || null
}

// ─── Fetch + transform a batch of meals ─────────────────────────────────────
export async function fetchIndianRecipes(limit = 30, batchSize = 5) {
  const list = await fetchIndianMealList()
  const selected = list.slice(0, limit)
  const results = []
  for (let i = 0; i < selected.length; i += batchSize) {
    const batch = selected.slice(i, i + batchSize)
    const meals = await Promise.all(batch.map((m) => fetchMealById(m.idMeal)))
    meals.forEach((meal) => { if (meal) results.push(transformMeal(meal)) })
  }
  return results
}

// ─── Search by keyword ────────────────────────────────────────────────────────
async function fetchBySearch(term) {
  try {
    const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(term)}`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.meals || []).map(transformMeal)
  } catch { return [] }
}

// ─── Expanded fetch: Indian area + keyword searches ───────────────────────────
// Gets substantially more recipes by combining area filter with Indian dish searches
export async function fetchMoreIndianRecipes(batchSize = 5) {
  const SEARCH_TERMS = ['biryani', 'curry', 'masala', 'paneer', 'dal', 'tikka', 'korma', 'dosa', 'samosa', 'paratha']

  // Fetch Indian area list and all keyword searches in parallel
  const [areaList, ...searchResults] = await Promise.all([
    fetchIndianMealList().catch(() => []),
    ...SEARCH_TERMS.map((t) => fetchBySearch(t)),
  ])

  // Collect all unique IDs from area list
  const seenIds = new Set()
  const allStubs = []
  areaList.forEach((m) => { if (!seenIds.has(m.idMeal)) { seenIds.add(m.idMeal); allStubs.push(m) } })

  // Fetch full details for area meals
  const areaResults = []
  for (let i = 0; i < allStubs.length; i += batchSize) {
    const batch = allStubs.slice(i, i + batchSize)
    const meals = await Promise.all(batch.map((m) => fetchMealById(m.idMeal).catch(() => null)))
    meals.forEach((meal) => { if (meal) areaResults.push(transformMeal(meal)) })
  }

  // Merge: area first, then keyword search results (dedup by id)
  const merged = [...areaResults]
  const mergedIds = new Set(areaResults.map((r) => r.id))
  searchResults.flat().forEach((r) => {
    if (!mergedIds.has(r.id)) { mergedIds.add(r.id); merged.push(r) }
  })

  return merged
}
