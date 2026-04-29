/**
 * AarogyaAnna Food Database — Master Index
 *
 * Combines all category modules into a single deduplicated array.
 * Each item is a full food object created by makeFoods() in base.js.
 *
 * Total coverage:
 *   fruits       ~120 items   vegetables   ~150 items
 *   grains       ~100 items   legumes       ~80 items
 *   nuts_seeds    ~65 items   spices        ~80 items
 *   dishes       ~200 items   sweets_snacks ~80 items
 *   beverages    ~90 items    meats        ~100 items
 *   oils          ~35 items   international ~80 items
 */

import fruits        from './fruits.js'
import vegetables    from './vegetables.js'
import grains        from './grains.js'
import legumes       from './legumes.js'
import nuts_seeds    from './nuts_seeds.js'
import spices        from './spices.js'
import dishes        from './dishes.js'
import sweets_snacks from './sweets_snacks.js'
import beverages     from './beverages_dairy.js'
import meats         from './meats.js'
import oils          from './oils.js'
import international from './international.js'

// Merge all arrays and deduplicate by id (first occurrence wins)
const allFoods = [
  ...fruits,
  ...vegetables,
  ...grains,
  ...legumes,
  ...nuts_seeds,
  ...spices,
  ...dishes,
  ...sweets_snacks,
  ...beverages,
  ...meats,
  ...oils,
  ...international,
]

const seen = new Set()
const foodsDb = allFoods.filter((item) => {
  if (!item || seen.has(item.id)) return false
  seen.add(item.id)
  return true
})

export default foodsDb

// Named helper: find a single item by id
export function getFoodById(id) {
  return foodsDb.find((f) => f.id === id) ?? null
}

// Named helper: search by name (multi-term)
export function searchFoodsDb(query) {
  if (!query?.trim()) return []
  const q = query.toLowerCase().trim()
  const terms = q.split(/\s+/)
  return foodsDb.filter((f) => {
    const hay = `${f.name} ${f.name_regional} ${f.category} ${(f.health_tags || []).join(' ')}`.toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}
