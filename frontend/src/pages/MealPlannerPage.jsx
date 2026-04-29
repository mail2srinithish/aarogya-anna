import { useState, useMemo, useCallback, useEffect } from 'react'
import mockRecipes from '../data/mockRecipes'
import indianFoods from '../data/foodsDb/index.js'
import { useProfileStore } from '../store/profileStore'
import { useMealPlanStore, DAYS, DAY_FULL, MEAL_SLOTS_POOL } from '../store/mealPlanStore'
import { getRDA } from '../utils/rda'
import { checkMealConflicts } from '../utils/foodConflicts'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_PORTIONS = {
  breakfast: 300, lunch: 400, snack: 150, dinner: 350,
  morning_snack: 150, post_dinner: 100,
}

const MACRO_NUTRIENTS = [
  { key: 'calories',  label: 'Calories', unit: 'kcal', icon: 'local_fire_department', color: '#ef4444', rdaKey: 'calories' },
  { key: 'protein_g', label: 'Protein',  unit: 'g',    icon: 'fitness_center',         color: '#8b5cf6', rdaKey: 'protein_g' },
  { key: 'carbs_g',   label: 'Carbs',    unit: 'g',    icon: 'grain',                  color: '#f59e0b', rdaKey: 'carbs_g' },
  { key: 'fat_g',     label: 'Fat',      unit: 'g',    icon: 'water_drop',             color: '#3b82f6', rdaKey: 'fat_g' },
  { key: 'fiber_g',   label: 'Fiber',    unit: 'g',    icon: 'grass',                  color: '#10b981', rdaKey: 'fiber_g' },
]

const MICRO_NUTRIENTS = [
  { key: 'iron_mg',        label: 'Iron',       unit: 'mg',  icon: 'opacity',         color: '#ef4444', rdaKey: 'iron_mg' },
  { key: 'calcium_mg',     label: 'Calcium',    unit: 'mg',  icon: 'biotech',         color: '#6366f1', rdaKey: 'calcium_mg' },
  { key: 'vitamin_c_mg',   label: 'Vitamin C',  unit: 'mg',  icon: 'eco',             color: '#f97316', rdaKey: 'vitamin_c_mg' },
  { key: 'vitamin_d_mcg',  label: 'Vitamin D',  unit: 'mcg', icon: 'wb_sunny',        color: '#eab308', rdaKey: 'vitamin_d_mcg' },
  { key: 'vitamin_b12_mcg',label: 'B12',        unit: 'mcg', icon: 'psychology',      color: '#06b6d4', rdaKey: 'vitamin_b12_mcg' },
  { key: 'folate_mcg',     label: 'Folate',     unit: 'mcg', icon: 'spa',             color: '#84cc16', rdaKey: 'folate_mcg' },
  { key: 'magnesium_mg',   label: 'Magnesium',  unit: 'mg',  icon: 'bolt',            color: '#a855f7', rdaKey: 'magnesium_mg' },
  { key: 'zinc_mg',        label: 'Zinc',       unit: 'mg',  icon: 'shield',          color: '#14b8a6', rdaKey: 'zinc_mg' },
  { key: 'potassium_mg',   label: 'Potassium',  unit: 'mg',  icon: 'favorite',        color: '#ec4899', rdaKey: 'potassium_mg' },
  { key: 'omega3_g',       label: 'Omega-3',    unit: 'g',   icon: 'waves',           color: '#0ea5e9', rdaKey: 'omega3_g' },
  { key: 'phosphorus_mg',  label: 'Phosphorus', unit: 'mg',  icon: 'science',         color: '#f472b6', rdaKey: 'phosphorus_mg' },
  { key: 'vitamin_a_mcg',  label: 'Vitamin A',  unit: 'mcg', icon: 'remove_red_eye',  color: '#fb923c', rdaKey: 'vitamin_a_mcg' },
]

const DEFAULT_RDA = {
  calories: 2000, protein_g: 50, carbs_g: 275, fat_g: 65, fiber_g: 25,
  iron_mg: 17, calcium_mg: 800, vitamin_c_mg: 40, vitamin_d_mcg: 15,
  vitamin_b12_mcg: 1.0, folate_mcg: 200, magnesium_mg: 340, zinc_mg: 12,
  potassium_mg: 3500, omega3_g: 1.6, phosphorus_mg: 700, vitamin_a_mcg: 600,
}

const GROCERY_CATS = ['Vegetables', 'Fruits', 'Legumes & Dal', 'Grains & Cereals', 'Dairy & Eggs', 'Nuts & Seeds', 'Spices & Herbs', 'Other']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scaleNutrition(nutrition, portion_g) {
  if (!nutrition || !portion_g) return {}
  const factor = portion_g / 100
  const result = {}
  Object.keys(nutrition).forEach((k) => {
    result[k] = Math.round((nutrition[k] || 0) * factor * 10) / 10
  })
  return result
}

function getSlotNutrition(slotItems) {
  const totals = {}
  const allKeys = [...MACRO_NUTRIENTS, ...MICRO_NUTRIENTS].map((n) => n.key)
  allKeys.forEach((k) => { totals[k] = 0 })
  slotItems.forEach(({ food, portion_g }) => {
    if (!food?.nutrition) return
    const scaled = scaleNutrition(food.nutrition, portion_g)
    allKeys.forEach((k) => { totals[k] = Math.round((totals[k] + (scaled[k] || 0)) * 10) / 10 })
  })
  return totals
}

function getDayNutrition(dayPlan) {
  const totals = {}
  const allKeys = [...MACRO_NUTRIENTS, ...MICRO_NUTRIENTS].map((n) => n.key)
  allKeys.forEach((k) => { totals[k] = 0 })
  MEAL_SLOTS_POOL.forEach(({ id }) => {
    const slotTotals = getSlotNutrition(dayPlan[id] || [])
    allKeys.forEach((k) => { totals[k] = Math.round((totals[k] + (slotTotals[k] || 0)) * 10) / 10 })
  })
  return totals
}

function getRDAForProfile(profile) {
  if (!profile?.age || !profile?.gender) return DEFAULT_RDA
  try { return getRDA(profile.age, profile.gender, profile.conditions || []) || DEFAULT_RDA }
  catch { return DEFAULT_RDA }
}

function categoriseIngredient(name) {
  const n = name.toLowerCase()
  if (/milk|paneer|curd|dahi|cheese|butter|ghee|egg/.test(n)) return 'Dairy & Eggs'
  if (/dal|lentil|rajma|chana|chickpea|moong|toor|urad|masoor/.test(n)) return 'Legumes & Dal'
  if (/rice|wheat|roti|bread|flour|atta|maida|oats|millet|ragi/.test(n)) return 'Grains & Cereals'
  if (/almond|walnut|cashew|peanut|seed|flax|chia|sesame|pumpkin/.test(n)) return 'Nuts & Seeds'
  if (/onion|tomato|potato|carrot|spinach|palak|methi|beans|peas|broccoli|cabbage|cauliflower|vegeta/.test(n)) return 'Vegetables'
  if (/mango|banana|apple|orange|lemon|amla|guava|papaya|fruit/.test(n)) return 'Fruits'
  if (/turmeric|cumin|coriander|pepper|ginger|garlic|chili|masala|spice|herb/.test(n)) return 'Spices & Herbs'
  return 'Other'
}

function aggregateGrocery(weekPlan) {
  const map = {}
  DAYS.forEach((day) => {
    MEAL_SLOTS_POOL.forEach(({ id }) => {
      ;(weekPlan[day][id] || []).forEach(({ food, portion_g }) => {
        if (!food) return
        const name = food.name || 'Unknown'
        const key = name.toLowerCase()
        if (!map[key]) map[key] = { name, qty: 0, unit: 'g', category: categoriseIngredient(name) }
        map[key].qty += portion_g
      })
    })
  })
  const groups = {}
  Object.values(map).forEach((item) => {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  })
  return groups
}

async function getAIDayAnalysis(dayName, dayPlan, activeMealSlots) {
  const sorted = [...activeMealSlots].sort((a, b) => a.timeOrder - b.timeOrder)
  const mealLines = sorted
    .map(({ id, label }) => {
      const items = dayPlan[id] || []
      if (!items.length) return null
      return `${label}: ${items.map((i) => `${i.food?.name} (${i.portion_g}g)`).join(', ')}`
    })
    .filter(Boolean)

  if (!mealLines.length) return null

  const message = `Analyze my ${dayName} Indian meal plan:\n${mealLines.join('\n')}\n\nPlease tell me: 1) Is this overall food combination healthy? 2) What are the nutritional gaps or concerns? 3) What specific changes or additions would improve this day's diet? Be concise and practical.`

  const res = await fetch('/api/chat/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error('AI service unavailable')
  const json = await res.json()
  return json.data.content
}

function renderAIText(text) {
  return text.split('\n\n').map((para, i) => {
    const lines = para.split('\n').filter((l) => l.trim())
    const isList = lines.every((l) => /^[\*\-\d]/.test(l.trim()))
    if (isList) {
      return (
        <ul key={i} className="space-y-1 my-1">
          {lines.map((line, j) => (
            <li key={j} className="flex gap-2 items-start text-sm text-gray-700">
              <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
              <span>{line.replace(/^[\*\-\d\.]\s*/, '').split(/(\*\*[^*]+\*\*)/).map((p, k) =>
                p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : p
              )}</span>
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="text-sm text-gray-700 leading-relaxed">
        {para.split(/(\*\*[^*]+\*\*)/).map((p, k) =>
          p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : p
        )}
      </p>
    )
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FoodItemRow({ item, onRemove, onChangePortionG }) {
  const { food, portion_g, uid: itemUid } = item
  if (!food) return null
  const scaled = scaleNutrition(food.nutrition || {}, portion_g)
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 group">
      <span className="text-xl flex-shrink-0">{food.food_emoji || food.emoji || '🍽️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{food.name}</p>
        <p className="text-xs text-gray-400">{scaled.calories || 0} kcal · {scaled.protein_g || 0}g P · {scaled.carbs_g || 0}g C</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onChangePortionG(itemUid, Math.max(25, portion_g - 25))} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>remove</span>
        </button>
        <span className="text-xs w-10 text-center font-medium text-gray-700">{portion_g}g</span>
        <button onClick={() => onChangePortionG(itemUid, portion_g + 25)} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>add</span>
        </button>
        {onRemove && (
          <button onClick={() => onRemove(itemUid)} className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors ml-1 opacity-0 group-hover:opacity-100">
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>close</span>
          </button>
        )}
      </div>
    </div>
  )
}

function RecipePickerModal({ open, onClose, onSelect, mealSlot }) {
  const [search, setSearch] = useState('')
  const allFoods = useMemo(() => {
    const seen = new Set()
    const combined = []
    ;[...indianFoods, ...mockRecipes].forEach((f) => {
      const key = (f.name || '').toLowerCase()
      if (!seen.has(key)) { seen.add(key); combined.push(f) }
    })
    return combined
  }, [])
  const filtered = useMemo(() => {
    if (!search.trim()) return allFoods.slice(0, 60)
    const q = search.toLowerCase()
    return allFoods.filter((f) =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.category || '').toLowerCase().includes(q) ||
      (f.meal_type || []).some((m) => m.toLowerCase().includes(q))
    ).slice(0, 60)
  }, [search, allFoods])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Add to {mealSlot?.label || 'Meal'}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Search foods, dishes, or ingredients</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined overflow-hidden text-gray-400" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="idly, sambar, banana, paneer..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.map((food) => (
            <button
              key={food.id}
              onClick={() => { onSelect(food); setSearch('') }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="text-2xl flex-shrink-0">{food.food_emoji || '🍽️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{food.name}</p>
                <p className="text-xs text-gray-500 truncate">{food.category} · {food.nutrition?.calories || 0} kcal/100g</p>
              </div>
              <div className="flex-shrink-0 flex flex-wrap gap-1 max-w-[80px] justify-end">
                {(food.health_tags || []).slice(0, 2).map((t) => (
                  <span key={t} className="text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5 leading-none">{t}</span>
                ))}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <span className="material-symbols-outlined overflow-hidden block mb-2" style={{ fontSize: '40px' }}>search_off</span>
              <p className="text-sm">No foods found for "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Day Detail View (inline, full editing + AI) ──────────────────────────────

function DayDetailView({ dayIndex, weekPlan, activeMealSlots, rda, onBack, onNavigate, onAddFood, onRemoveFood, onChangePortionG }) {
  const day = DAYS[dayIndex]
  const dayPlan = weekPlan[day]
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

  // Reset AI result when day changes
  useEffect(() => {
    setAiResult(null)
    setAiError(null)
  }, [dayIndex])

  const dayNutrition = useMemo(() => getDayNutrition(dayPlan), [dayPlan])

  // Sort meal slots chronologically for display
  const sortedSlots = useMemo(() =>
    [...activeMealSlots].sort((a, b) => a.timeOrder - b.timeOrder),
    [activeMealSlots]
  )

  const allConflicts = useMemo(() => {
    const result = []
    sortedSlots.forEach(({ id, label }) => {
      const c = checkMealConflicts(dayPlan[id] || [])
      if (c.length) result.push({ slot: label, conflicts: c })
    })
    return result
  }, [dayPlan, sortedSlots])

  const totalFoods = sortedSlots.reduce((sum, { id }) => sum + (dayPlan[id]?.length || 0), 0)

  async function handleAIAnalysis() {
    setAiLoading(true)
    setAiError(null)
    try {
      const result = await getAIDayAnalysis(DAY_FULL[dayIndex], dayPlan, activeMealSlots)
      if (!result) {
        setAiError('Add some foods to your plan first to get an AI analysis.')
      } else {
        setAiResult(result)
      }
    } catch (err) {
      setAiError(`Could not reach AI service. ${err.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Day header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-xl text-gray-900">{DAY_FULL[dayIndex]}</h2>
          <p className="text-sm text-gray-500">{totalFoods} food{totalFoods !== 1 ? 's' : ''} · {dayNutrition.calories || 0} kcal total</p>
        </div>
        {/* Prev / Next */}
        <div className="flex gap-1">
          <button
            onClick={() => onNavigate(-1)}
            disabled={dayIndex === 0}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>chevron_left</span>
          </button>
          <button
            onClick={() => onNavigate(1)}
            disabled={dayIndex === 6}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Meal slots (editable) ── */}
        <div className="lg:col-span-3 space-y-4">
          {sortedSlots.map(({ id, label, icon, color, bg }) => {
            const items = dayPlan[id] || []
            const slotN = getSlotNutrition(items)
            const conflicts = checkMealConflicts(items)
            return (
              <div key={id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Slot header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px', color }}>{icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    {items.length > 0 && (
                      <p className="text-xs text-gray-400">{slotN.calories || 0} kcal · P {slotN.protein_g || 0}g · C {slotN.carbs_g || 0}g · F {slotN.fat_g || 0}g</p>
                    )}
                  </div>
                  {conflicts.length > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>warning</span>
                      {conflicts.length}
                    </span>
                  )}
                </div>

                {/* Conflict details */}
                {conflicts.length > 0 && (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                    {conflicts.slice(0, 2).map((c) => (
                      <p key={c.id} className="text-xs text-amber-700">⚠ {c.title} — {c.tip}</p>
                    ))}
                  </div>
                )}

                {/* Food items */}
                <div className="p-3 space-y-2">
                  {items.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">No foods added yet</p>
                  )}
                  {items.map((item) => (
                    <FoodItemRow
                      key={item.uid}
                      item={item}
                      onRemove={(itemUid) => onRemoveFood(day, id, itemUid)}
                      onChangePortionG={(itemUid, newPortion) => onChangePortionG(day, id, itemUid, newPortion)}
                    />
                  ))}
                  <button
                    onClick={() => onAddFood(day, id)}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-primary font-medium py-2 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '16px' }}>add</span>
                    Add food to {label}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Right: Nutrition + AI ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Macro rings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Macronutrients</h3>
            <div className="grid grid-cols-3 gap-3">
              {MACRO_NUTRIENTS.map(({ key, label, unit, color }) => {
                const val = dayNutrition[key] || 0
                const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
                const pct = Math.min(100, Math.round((val / rdaVal) * 100))
                const r = 22, circ = 2 * Math.PI * r
                return (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <div className="relative w-14 h-14">
                      <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                        <circle cx="28" cy="28" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
                        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
                          strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{pct}%</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{val}{unit}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Micro bars */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Micronutrients vs ICMR-RDA</h3>
            <div className="space-y-2.5">
              {MICRO_NUTRIENTS.map(({ key, label, unit, color }) => {
                const val = dayNutrition[key] || 0
                const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
                const pct = Math.min(100, Math.round((val / rdaVal) * 100))
                const status = pct >= 90 ? 'Optimal' : pct >= 60 ? 'Adequate' : pct >= 30 ? 'Low' : 'Deficient'
                const statusColor = { Optimal: '#10b981', Adequate: '#f59e0b', Low: '#f97316', Deficient: '#ef4444' }[status]
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{val}{unit}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ color: statusColor, background: statusColor + '20' }}>{status}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Optimization tips */}
          {MICRO_NUTRIENTS.some(({ key }) => {
            const val = dayNutrition[key] || 0
            const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
            return (val / rdaVal) < 0.6
          }) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined overflow-hidden text-amber-500" style={{ fontSize: '16px' }}>tips_and_updates</span>
                Quick Suggestions
              </h3>
              <div className="space-y-2">
                {MICRO_NUTRIENTS.filter(({ key }) => {
                  const val = dayNutrition[key] || 0
                  const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
                  return (val / rdaVal) < 0.6
                }).slice(0, 3).map(({ key, label, unit }) => {
                  const val = dayNutrition[key] || 0
                  const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
                  const needed = Math.round(rdaVal - val)
                  return (
                    <div key={key} className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                      <span className="material-symbols-outlined overflow-hidden text-amber-500 flex-shrink-0" style={{ fontSize: '14px' }}>add_circle</span>
                      <p className="text-amber-800">
                        <strong>{label}</strong> needs {needed}{unit} more.{' '}
                        {key === 'iron_mg' && 'Try spinach, ragi, or rajma.'}
                        {key === 'calcium_mg' && 'Try milk, sesame, or ragi.'}
                        {key === 'vitamin_c_mg' && 'Try amla, lemon, or guava.'}
                        {key === 'vitamin_d_mcg' && 'Try egg yolk or fortified milk.'}
                        {key === 'folate_mcg' && 'Try leafy greens or dal.'}
                        {key === 'omega3_g' && 'Try flaxseed or walnuts.'}
                        {key === 'zinc_mg' && 'Try pumpkin seeds or cashews.'}
                        {key === 'magnesium_mg' && 'Try almonds or spinach.'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined overflow-hidden text-primary" style={{ fontSize: '18px' }}>auto_awesome</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">AI Diet Analysis</h3>
                <p className="text-xs text-gray-400">Powered by AarogyaAI · Groq</p>
              </div>
            </div>

            {!aiResult && !aiLoading && !aiError && (
              <button
                onClick={handleAIAnalysis}
                disabled={totalFoods === 0}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>psychology</span>
                {totalFoods === 0 ? 'Add foods first' : 'Analyse this day\'s diet'}
              </button>
            )}

            {aiLoading && (
              <div className="flex items-center gap-3 py-4 text-gray-500">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">Analysing your meal plan...</span>
              </div>
            )}

            {aiError && (
              <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{aiError}</div>
            )}

            {aiResult && (
              <div className="space-y-1">
                <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1.5">
                  {renderAIText(aiResult)}
                </div>
                <button
                  onClick={() => { setAiResult(null); setAiError(null) }}
                  className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>refresh</span>
                  Re-analyse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MealPlannerPage() {
  const profile = useProfileStore((s) => s.profile)
  const rda = useMemo(() => getRDAForProfile(profile), [profile])

  // ── Shared persistent store ──────────────────────────────────────────────
  const {
    weekPlan, mealCount,
    addItem, removeItem, updatePortion, setMealCount, resetWeek,
  } = useMealPlanStore()

  const [activeTab, setActiveTab] = useState('planner')
  const [selectedDay, setSelectedDay] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(null)       // { day, slotId }
  const [activeDayView, setActiveDayView] = useState(null) // null = weekly view, 0-6 = day view
  const [groceryChecked, setGroceryChecked] = useState({})

  // Active meal slots based on meal count
  const activeMealSlots = useMemo(() => MEAL_SLOTS_POOL.slice(0, mealCount), [mealCount])

  // Add food item
  const addFood = useCallback((food) => {
    if (!pickerOpen) return
    const { day, slotId } = pickerOpen
    const portion = SUGGESTED_PORTIONS[slotId] || 200
    addItem(day, slotId, food, portion)
    setPickerOpen(null)
  }, [pickerOpen, addItem])

  // Remove food item (only from day view)
  const removeFood = useCallback((day, slotId, itemUid) => {
    removeItem(day, slotId, itemUid)
  }, [removeItem])

  // Change portion
  const changePortionG = useCallback((day, slotId, itemUid, newPortion) => {
    updatePortion(day, slotId, itemUid, newPortion)
  }, [updatePortion])

  const clearWeek = useCallback(() => resetWeek(), [resetWeek])

  const weeklyAnalysisData = useMemo(() => DAYS.map((day) => {
    const dn = getDayNutrition(weekPlan[day])
    return { day, calories: dn.calories || 0, protein: dn.protein_g || 0, carbs: dn.carbs_g || 0, fat: dn.fat_g || 0 }
  }), [weekPlan])

  const groceryGroups = useMemo(() => aggregateGrocery(weekPlan), [weekPlan])
  const selectedDayNutrition = useMemo(() => getDayNutrition(weekPlan[DAYS[selectedDay]]), [weekPlan, selectedDay])

  const copyGrocery = () => {
    const lines = []
    GROCERY_CATS.forEach((cat) => {
      const items = groceryGroups[cat] || []
      if (items.length) {
        lines.push(`\n${cat}:`)
        items.forEach((i) => lines.push(`  - ${i.name}: ${Math.round(i.qty)}g`))
      }
    })
    navigator.clipboard?.writeText(lines.join('\n'))
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-on-surface font-display">Weekly Meal Planner</h1>
            <p className="text-sm text-gray-500">Click a day to plan & analyse · ICMR-RDA tracking</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Meal count control */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-medium text-gray-600">Meals/day</span>
              <button
                onClick={() => setMealCount((c) => Math.max(2, c - 1))}
                disabled={mealCount <= 2}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>remove</span>
              </button>
              <span className="text-sm font-bold text-primary w-4 text-center">{mealCount}</span>
              <button
                onClick={() => setMealCount((c) => Math.min(6, c + 1))}
                disabled={mealCount >= 6}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>add</span>
              </button>
            </div>
            <button
              onClick={clearWeek}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '16px' }}>restart_alt</span>
              Clear
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-0 flex gap-1">
          {[
            { id: 'planner',  label: 'Planner',      icon: 'calendar_month' },
            { id: 'analysis', label: 'Nutrition',     icon: 'bar_chart' },
            { id: 'grocery',  label: 'Grocery List',  icon: 'shopping_basket' },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); if (id !== 'planner') setActiveDayView(null) }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '16px' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── PLANNER TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'planner' && (
          <>
            {activeDayView !== null ? (
              /* ── DAY DETAIL VIEW ── */
              <DayDetailView
                dayIndex={activeDayView}
                weekPlan={weekPlan}
                activeMealSlots={activeMealSlots}
                rda={rda}
                onBack={() => setActiveDayView(null)}
                onNavigate={(dir) => setActiveDayView((i) => Math.min(6, Math.max(0, i + dir)))}
                onAddFood={(day, slotId) => setPickerOpen({ day, slotId })}
                onRemoveFood={removeFood}
                onChangePortionG={changePortionG}
              />
            ) : (
              /* ── WEEKLY GRID (compact, read-only foods) ── */
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="min-w-[900px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    <div className="text-xs font-semibold text-gray-400 px-2 py-1">Meal</div>
                    {DAYS.map((day, i) => {
                      const dayN = getDayNutrition(weekPlan[day])
                      const calPct = Math.min(100, Math.round(((dayN.calories || 0) / (rda.calories || 2000)) * 100))
                      const hasConflicts = activeMealSlots.some(({ id }) => checkMealConflicts(weekPlan[day][id] || []).length > 0)
                      const totalItems = activeMealSlots.reduce((s, { id }) => s + (weekPlan[day][id]?.length || 0), 0)
                      return (
                        <button
                          key={day}
                          onClick={() => setActiveDayView(i)}
                          className="text-left p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-primary/20 group"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{day}</p>
                            <span className="material-symbols-outlined overflow-hidden text-gray-300 group-hover:text-primary transition-colors" style={{ fontSize: '14px' }}>chevron_right</span>
                          </div>
                          <p className="text-xs text-gray-500">{dayN.calories || 0} kcal</p>
                          <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${calPct}%` }} />
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            {totalItems > 0 && (
                              <span className="text-xs text-gray-400">{totalItems} food{totalItems !== 1 ? 's' : ''}</span>
                            )}
                            {hasConflicts && (
                              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '10px' }}>warning</span>
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Meal rows — compact food chips + add button */}
                  {activeMealSlots.map(({ id: slotId, label, icon, color, bg }) => (
                    <div key={slotId} className="grid grid-cols-8 gap-2 mb-2">
                      {/* Slot label */}
                      <div className="flex items-center gap-2 px-2 py-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px', color }}>{icon}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">{label}</p>
                      </div>

                      {/* Day cells */}
                      {DAYS.map((day) => {
                        const items = weekPlan[day][slotId] || []
                        const slotN = getSlotNutrition(items)
                        return (
                          <div key={day} className="bg-white rounded-xl border border-gray-100 p-2 min-h-[90px] flex flex-col gap-1">
                            {/* Compact food chips */}
                            {items.length > 0 ? (
                              <>
                                <div className="flex flex-col gap-1 flex-1">
                                  {items.slice(0, 3).map((item) => (
                                    <div key={item.uid} className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 rounded-lg px-1.5 py-0.5">
                                      <span className="text-sm leading-none flex-shrink-0">{item.food?.food_emoji || item.food?.emoji || '🍽️'}</span>
                                      <span className="truncate">{item.food?.name}</span>
                                    </div>
                                  ))}
                                  {items.length > 3 && (
                                    <p className="text-xs text-gray-400 pl-1">+{items.length - 3} more</p>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400">{slotN.calories || 0} kcal</p>
                              </>
                            ) : (
                              <div className="flex-1 flex items-center justify-center">
                                <span className="text-xs text-gray-300">Empty</span>
                              </div>
                            )}
                            {/* Add button (only in weekly view — no remove) */}
                            <button
                              onClick={() => setPickerOpen({ day, slotId })}
                              className="flex items-center justify-center gap-0.5 text-xs text-primary font-medium py-1 rounded-lg hover:bg-primary/10 transition-colors"
                            >
                              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '13px' }}>add</span>
                              Add
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ))}

                  {/* Active meal slots info */}
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Showing {mealCount} meal{mealCount !== 1 ? 's' : ''}: {activeMealSlots.map((s) => s.label).join(', ')} ·
                    <button onClick={() => setActiveDayView(0)} className="text-primary hover:underline ml-1">Click any day to edit & analyse</button>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ANALYSIS TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedDay === i ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">Weekly Calorie Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyAnalysisData} barSize={28}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
                    {weeklyAnalysisData.map((_, index) => (
                      <Cell key={index} fill={index === selectedDay ? '#154212' : '#bcf0ae'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">{DAY_FULL[selectedDay]} — Macronutrients</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {MACRO_NUTRIENTS.map(({ key, label, unit, color }) => {
                  const val = selectedDayNutrition[key] || 0
                  const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
                  const pct = Math.min(100, Math.round((val / rdaVal) * 100))
                  const r = 30, circ = 2 * Math.PI * r
                  return (
                    <div key={key} className="flex flex-col items-center gap-2">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 72 72" className="w-20 h-20 -rotate-90">
                          <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
                          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                            strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">{pct}%</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">{label}</p>
                        <p className="text-xs text-gray-500">{val}{unit} / {rdaVal}{unit}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">{DAY_FULL[selectedDay]} — Micronutrients vs ICMR-RDA</h3>
              <div className="space-y-3">
                {MICRO_NUTRIENTS.map(({ key, label, unit, color, icon }) => {
                  const val = selectedDayNutrition[key] || 0
                  const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
                  const pct = Math.min(100, Math.round((val / rdaVal) * 100))
                  const status = pct >= 90 ? 'Optimal' : pct >= 60 ? 'Adequate' : pct >= 30 ? 'Low' : 'Deficient'
                  const statusColor = { Optimal: '#10b981', Adequate: '#f59e0b', Low: '#f97316', Deficient: '#ef4444' }[status]
                  return (
                    <div key={key} className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px', color }}>{icon}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-700 truncate">{label}</span>
                      </div>
                      <div className="col-span-5">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                      <div className="col-span-2 text-xs text-gray-500 text-right">{val}{unit}</div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: statusColor, background: statusColor + '20' }}>{status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── GROCERY TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'grocery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Weekly Grocery List</h2>
                <p className="text-sm text-gray-500">Auto-generated from your meal plan</p>
              </div>
              <button
                onClick={copyGrocery}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '16px' }}>content_copy</span>
                Copy List
              </button>
            </div>

            {Object.values(groceryGroups).flat().length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <span className="material-symbols-outlined overflow-hidden text-gray-300 block mb-3" style={{ fontSize: '48px' }}>shopping_basket</span>
                <p className="text-gray-500 font-medium">Your grocery list is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add foods to your meal plan to generate a grocery list</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GROCERY_CATS.map((cat) => {
                  const items = groceryGroups[cat] || []
                  if (!items.length) return null
                  return (
                    <div key={cat} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined overflow-hidden text-primary" style={{ fontSize: '18px' }}>category</span>
                        {cat}
                        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 ml-auto">{items.length}</span>
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const key = item.name.toLowerCase()
                          return (
                            <label key={key} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={!!groceryChecked[key]}
                                onChange={(e) => setGroceryChecked((prev) => ({ ...prev, [key]: e.target.checked }))}
                                className="w-4 h-4 rounded accent-primary"
                              />
                              <span className={`text-sm flex-1 transition-colors ${groceryChecked[key] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {item.name}
                              </span>
                              <span className="text-xs text-gray-400 flex-shrink-0">{Math.round(item.qty)}g</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Food picker modal */}
      <RecipePickerModal
        open={!!pickerOpen}
        onClose={() => setPickerOpen(null)}
        onSelect={addFood}
        mealSlot={pickerOpen ? MEAL_SLOTS_POOL.find((s) => s.id === pickerOpen.slotId) : null}
      />
    </div>
  )
}
