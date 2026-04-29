/**
 * Open Food Facts API Service — free, unlimited, no API key
 * Using v2 search endpoint which returns much better results than old search.pl
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

const OFF_BASE = 'https://world.openfoodfacts.org'

// ── Nutrition field mapping: OFF → AarogyaAnna ───────────────────────────────
function extractNutrition(n) {
  if (!n) return {}
  const get = (keys) => {
    for (const k of keys) {
      const v = n[k] ?? n[`${k}_100g`] ?? n[`${k}_serving`]
      if (v !== undefined && v !== null && v !== '') return parseFloat(v) || 0
    }
    return 0
  }

  const fat       = get(['fat_100g', 'fat'])
  const saturated = get(['saturated-fat_100g', 'saturated-fat'])
  const protein   = get(['proteins_100g', 'proteins', 'protein_100g'])
  const carbs     = get(['carbohydrates_100g', 'carbohydrates'])
  const sugar     = get(['sugars_100g', 'sugars'])
  const fiber     = get(['fiber_100g', 'fiber', 'dietary-fiber_100g'])
  const sodium    = get(['sodium_100g', 'sodium'])
  const calories  = get(['energy-kcal_100g', 'energy-kcal', 'energy_100g']) ||
                    Math.round(protein * 4 + carbs * 4 + fat * 9)

  return {
    calories:          Math.round(calories),
    protein_g:         Math.round(protein * 10) / 10,
    carbs_g:           Math.round(carbs * 10) / 10,
    fat_g:             Math.round(fat * 10) / 10,
    fiber_g:           Math.round(fiber * 10) / 10,
    sugar_g:           Math.round(sugar * 10) / 10,
    saturated_fat_g:   Math.round(saturated * 10) / 10,
    trans_fat_g:       0,
    sodium_mg:         Math.round(sodium * 1000),
    cholesterol_mg:    0,
    potassium_mg:      get(['potassium_100g', 'potassium']) || 200,
    calcium_mg:        get(['calcium_100g', 'calcium']) || 0,
    iron_mg:           get(['iron_100g', 'iron']) || 0,
    vitamin_c_mg:      get(['vitamin-c_100g', 'vitamin-c', 'vitamin_c_100g']) || 0,
    vitamin_a_mcg:     get(['vitamin-a_100g', 'vitamin-a']) || 0,
    magnesium_mg:      get(['magnesium_100g', 'magnesium']) || 0,
    zinc_mg:           get(['zinc_100g', 'zinc']) || 0,
    phosphorus_mg:     get(['phosphorus_100g', 'phosphorus']) || 100,
    folate_mcg:        get(['folate_100g', 'folate', 'vitamin-b9_100g']) || 0,
    vitamin_d_mcg:     get(['vitamin-d_100g', 'vitamin-d']) || 0,
    vitamin_b12_mcg:   get(['vitamin-b12_100g', 'vitamin-b12']) || 0,
    omega3_g:          0,
    glycemic_index:    55,
    serving_size_g:    100,
  }
}

// ── Guess diet type from ingredients/labels ───────────────────────────────────
function guessDiet(product) {
  const labels     = ((product.labels_tags || []).join(' ')).toLowerCase()
  const ingredText = (product.ingredients_text || '').toLowerCase()
  if (labels.includes('vegan') || labels.includes('en:vegan')) return ['vegan', 'vegetarian']
  if (labels.includes('vegetarian') || labels.includes('en:vegetarian')) return ['vegetarian']
  const nonVegTerms = /chicken|mutton|lamb|pork|beef|fish|prawn|egg|meat|seafood|turkey/
  if (nonVegTerms.test(ingredText)) return ['non-vegetarian']
  return ['vegetarian']
}

// ── Health score from nutrition ───────────────────────────────────────────────
function calcHealthScore(n) {
  return Math.min(100, Math.round(
    (Math.min(n.fiber_g / 28, 1) * 20) +
    (Math.min(n.protein_g / 50, 1) * 20) +
    (Math.max(0, 1 - n.sugar_g / 50) * 20) +
    (Math.max(0, 1 - n.saturated_fat_g / 20) * 20) +
    (Math.max(0, 1 - n.sodium_mg / 2300) * 20)
  ))
}

// ── Transform a single OFF product → AarogyaAnna food item ──────────────────
export function transformOFFProduct(product) {
  if (!product) return null
  const name = (product.product_name_en || product.product_name || '').trim()
  if (!name || name.toLowerCase() === 'unknown food') return null

  const nutrition = extractNutrition(
    product.nutriments || product.nutriments_estimated || {}
  )

  const cat = (product.food_groups_tags?.[0] || product.categories_tags?.[0] || 'food')
               .replace(/^en:/, '')
               .replace(/-/g, ' ')

  return {
    id:             `off_${product.code || product._id || Math.random().toString(36).slice(2)}`,
    name,
    name_regional:  product.product_name_hi || product.product_name || name,
    category:       cat,
    food_emoji:     '🥘',
    source:         'food_item',
    description:    product.generic_name_en || product.generic_name || product.product_name || '',
    image_url:      product.image_front_small_url || product.image_url || null,
    meal_type:      ['lunch', 'dinner'],
    diet_type:      guessDiet(product),
    region:         'india',
    state:          'India',
    cuisine_tags:   ['indian', cat],
    health_tags:    nutrition.fiber_g > 5 ? ['High-Fiber'] : [],
    ayurveda_type:  'sattvic',
    season_tags:    ['all-year'],
    festival_tags:  [],
    health_score:   calcHealthScore(nutrition),
    rating:         3.5 + Math.random() * 1.5,
    reviews:        Math.floor(10 + Math.random() * 200),
    prep_time_mins: 0,
    cook_time_mins: 0,
    servings:       1,
    steps:          [],
    ingredients:    [],
    nutrition,
  }
}

// ── Field list for API requests ────────────────────────────────────────────────
const FIELDS = [
  'code', 'product_name', 'product_name_en', 'product_name_hi',
  'generic_name', 'generic_name_en', 'categories_tags', 'food_groups_tags',
  'labels_tags', 'ingredients_text',
  'image_front_small_url', 'image_url',
  'nutriments',
].join(',')

// ── v2 search (primary — much better than search.pl) ─────────────────────────
export async function searchOFFv2(query, page = 1, pageSize = 24) {
  if (!query?.trim()) return { items: [], total: 0, hasMore: false }

  const params = new URLSearchParams({
    q:         query.trim(),
    page_size: pageSize,
    page,
    fields:    FIELDS,
    json:      1,
  })

  try {
    const res = await fetch(`${OFF_BASE}/api/v2/search?${params}`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) throw new Error(`OFF v2 search failed: ${res.status}`)
    const data = await res.json()
    const items = (data.products || [])
      .map(transformOFFProduct)
      .filter(Boolean)

    return {
      items,
      total:   data.count || 0,
      hasMore: page * pageSize < (data.count || 0),
    }
  } catch (err) {
    console.warn('[OFF v2] search error:', err.message)
    return { items: [], total: 0, hasMore: false }
  }
}

// ── Broad search (fallback, old endpoint) ─────────────────────────────────────
export async function searchOFFBroad(query, page = 1, pageSize = 24) {
  // Alias: keep old name but delegate to v2
  return searchOFFv2(query, page, pageSize)
}

// ── Search with word-by-word fallback for compound queries ───────────────────
export async function searchOFFWithFallback(query, page = 1, pageSize = 24) {
  if (!query?.trim()) return { items: [], total: 0, hasMore: false }

  const result = await searchOFFv2(query, page, pageSize)
  if (result.items.length > 0 || page > 1) return result

  // Zero results — retry with first significant word
  const words = query.trim().split(/\s+/).filter((w) => w.length > 2)
  if (words.length > 1) {
    const fallback = await searchOFFv2(words[0], page, pageSize)
    return { ...fallback, isFallback: true, fallbackTerm: words[0] }
  }

  return result
}

// ── Fetch a single product by barcode ─────────────────────────────────────────
export async function fetchOFFProductByCode(code) {
  if (!code) return null
  try {
    const res = await fetch(
      `${OFF_BASE}/api/v2/product/${code}.json?fields=${FIELDS}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) throw new Error(`OFF product fetch failed: ${res.status}`)
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null
    return transformOFFProduct(data.product)
  } catch (err) {
    console.warn('[OFF] product fetch error:', err.message)
    return null
  }
}

// ── Popular Indian food search terms for initial browse ─────────────────────
export const POPULAR_INDIAN_SEARCHES = [
  'biryani', 'dal', 'roti', 'rice', 'idli', 'dosa', 'samosa', 'paneer',
  'rajma', 'chole', 'poha', 'upma', 'khichdi', 'paratha', 'sabzi',
  'halwa', 'kheer', 'ladoo', 'barfi', 'gulab jamun',
]
