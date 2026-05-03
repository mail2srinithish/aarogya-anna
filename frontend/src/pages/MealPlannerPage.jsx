import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import mockRecipes from '../data/mockRecipes'
import indianFoods from '../data/foodsDb/index.js'
import { useProfileStore } from '../store/profileStore'
import {
  useMealPlanStore, DAYS, DAY_FULL, MEAL_SLOTS_POOL,
  getMondayKey, getWeekDates, dateKey, getTodayDayIndex,
} from '../store/mealPlanStore'
import { getRDA } from '../utils/rda'
import { checkMealConflicts } from '../utils/foodConflicts'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_PORTIONS = {
  breakfast: 300, lunch: 400, snack: 150, dinner: 350,
  morning_snack: 150, post_dinner: 100,
}

const MACRO_NUTRIENTS = [
  { key: 'calories',  label: 'Calories', unit: 'kcal', color: '#ef4444', rdaKey: 'calories' },
  { key: 'protein_g', label: 'Protein',  unit: 'g',    color: '#8b5cf6', rdaKey: 'protein_g' },
  { key: 'carbs_g',   label: 'Carbs',    unit: 'g',    color: '#f59e0b', rdaKey: 'carbs_g' },
  { key: 'fat_g',     label: 'Fat',      unit: 'g',    color: '#3b82f6', rdaKey: 'fat_g' },
  { key: 'fiber_g',   label: 'Fiber',    unit: 'g',    color: '#10b981', rdaKey: 'fiber_g' },
]

const MICRO_NUTRIENTS = [
  { key: 'iron_mg',         label: 'Iron',      unit: 'mg',  color: '#ef4444', icon: 'opacity' },
  { key: 'calcium_mg',      label: 'Calcium',   unit: 'mg',  color: '#6366f1', icon: 'biotech' },
  { key: 'vitamin_c_mg',    label: 'Vit C',     unit: 'mg',  color: '#f97316', icon: 'eco' },
  { key: 'vitamin_d_mcg',   label: 'Vit D',     unit: 'mcg', color: '#eab308', icon: 'wb_sunny' },
  { key: 'vitamin_b12_mcg', label: 'B12',       unit: 'mcg', color: '#06b6d4', icon: 'psychology' },
  { key: 'folate_mcg',      label: 'Folate',    unit: 'mcg', color: '#84cc16', icon: 'spa' },
  { key: 'magnesium_mg',    label: 'Magnesium', unit: 'mg',  color: '#a855f7', icon: 'bolt' },
  { key: 'zinc_mg',         label: 'Zinc',      unit: 'mg',  color: '#14b8a6', icon: 'shield' },
  { key: 'potassium_mg',    label: 'Potassium', unit: 'mg',  color: '#ec4899', icon: 'favorite' },
  { key: 'omega3_g',        label: 'Omega-3',   unit: 'g',   color: '#0ea5e9', icon: 'waves' },
]

const DEFAULT_RDA = {
  calories: 2000, protein_g: 50, carbs_g: 275, fat_g: 65, fiber_g: 25,
  iron_mg: 17, calcium_mg: 800, vitamin_c_mg: 40, vitamin_d_mcg: 15,
  vitamin_b12_mcg: 1.0, folate_mcg: 200, magnesium_mg: 340, zinc_mg: 12,
  potassium_mg: 3500, omega3_g: 1.6, phosphorus_mg: 700, vitamin_a_mcg: 600,
}

const GROCERY_CATS = ['Vegetables', 'Fruits', 'Legumes & Dal', 'Grains & Cereals', 'Dairy & Eggs', 'Nuts & Seeds', 'Spices & Herbs', 'Other']

// Slot priority: always show Breakfast, Lunch, Dinner first
const SLOT_PRIORITY = ['breakfast', 'lunch', 'dinner', 'snack', 'morning_snack', 'post_dinner']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scaleNutrition(nutrition, portion_g) {
  if (!nutrition || !portion_g) return {}
  const f = portion_g / 100
  const r = {}
  Object.keys(nutrition).forEach((k) => { r[k] = Math.round((nutrition[k] || 0) * f * 10) / 10 })
  return r
}

function getSlotNutrition(items) {
  const all = [...MACRO_NUTRIENTS, ...MICRO_NUTRIENTS].map((n) => n.key)
  const t = Object.fromEntries(all.map((k) => [k, 0]))
  items.forEach(({ food, portion_g }) => {
    if (!food?.nutrition) return
    const s = scaleNutrition(food.nutrition, portion_g)
    all.forEach((k) => { t[k] = Math.round((t[k] + (s[k] || 0)) * 10) / 10 })
  })
  return t
}

function getDayNutrition(dayPlan) {
  const all = [...MACRO_NUTRIENTS, ...MICRO_NUTRIENTS].map((n) => n.key)
  const t = Object.fromEntries(all.map((k) => [k, 0]))
  MEAL_SLOTS_POOL.forEach(({ id }) => {
    const s = getSlotNutrition(dayPlan?.[id] || [])
    all.forEach((k) => { t[k] = Math.round((t[k] + (s[k] || 0)) * 10) / 10 })
  })
  return t
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
  if (/onion|tomato|potato|carrot|spinach|palak|methi|beans|peas|broccoli|cabbage/.test(n)) return 'Vegetables'
  if (/mango|banana|apple|orange|lemon|amla|guava|papaya|fruit/.test(n)) return 'Fruits'
  if (/turmeric|cumin|coriander|pepper|ginger|garlic|chili|masala|spice/.test(n)) return 'Spices & Herbs'
  return 'Other'
}

function aggregateGrocery(weekPlan) {
  const map = {}
  DAYS.forEach((day) => {
    MEAL_SLOTS_POOL.forEach(({ id }) => {
      ;(weekPlan[day]?.[id] || []).forEach(({ food, portion_g }) => {
        if (!food) return
        const key = (food.name || '').toLowerCase()
        if (!map[key]) map[key] = { name: food.name, qty: 0, category: categoriseIngredient(food.name) }
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
  const lines = [...activeMealSlots]
    .sort((a, b) => a.timeOrder - b.timeOrder)
    .map(({ id, label }) => {
      const items = dayPlan?.[id] || []
      if (!items.length) return null
      return `${label}: ${items.map((i) => `${i.food?.name} (${i.portion_g}g)`).join(', ')}`
    })
    .filter(Boolean)
  if (!lines.length) return null
  const res = await fetch('/api/chat/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Analyse my ${dayName} Indian meal plan:\n${lines.join('\n')}\n\nPlease tell me: 1) Is this healthy? 2) Nutritional gaps? 3) What specific improvements? Be concise.` }),
  })
  if (!res.ok) throw new Error('AI service unavailable')
  const json = await res.json()
  return json.data.content
}

function renderAIText(text) {
  return text.split('\n\n').map((para, i) => {
    const lines = para.split('\n').filter((l) => l.trim())
    if (lines.every((l) => /^[\*\-\d]/.test(l.trim()))) {
      return (
        <ul key={i} className="space-y-1 my-1">
          {lines.map((line, j) => (
            <li key={j} className="flex gap-2 items-start text-sm text-gray-700">
              <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
              <span>{line.replace(/^[\*\-\d\.]\s*/, '').split(/(\*\*[^*]+\*\*)/).map((p, k) =>
                p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : p)}</span>
            </li>
          ))}
        </ul>
      )
    }
    return <p key={i} className="text-sm text-gray-700 leading-relaxed">{para.split(/(\*\*[^*]+\*\*)/).map((p, k) =>
      p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : p)}</p>
  })
}

// ─── Food Item Row ─────────────────────────────────────────────────────────────

function FoodItemRow({ item, onRemove, onChangePortionG, draggable, onDragStart }) {
  const { food, portion_g, uid: itemUid } = item
  if (!food) return null
  const scaled = scaleNutrition(food.nutrition || {}, portion_g)
  return (
    <div
      className={`flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 group ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      draggable={!!draggable}
      onDragStart={onDragStart}
    >
      <span className="text-xl flex-shrink-0">{food.food_emoji || '🍽️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{food.name}</p>
        <p className="text-xs text-gray-400">{scaled.calories || 0} kcal · {scaled.protein_g || 0}g P · {scaled.carbs_g || 0}g C</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onChangePortionG(itemUid, Math.max(25, portion_g - 25))}
          className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>remove</span>
        </button>
        <span className="text-xs w-10 text-center font-medium text-gray-700">{portion_g}g</span>
        <button onClick={() => onChangePortionG(itemUid, portion_g + 25)}
          className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>add</span>
        </button>
        <button onClick={() => onRemove(itemUid)}
          className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>close</span>
        </button>
      </div>
    </div>
  )
}

// ─── Food Picker Modal ─────────────────────────────────────────────────────────

function RecipePickerModal({ open, onClose, mealSlot, onSelectDay, onSelectAllWeek }) {
  const [search, setSearch] = useState('')
  const [chosen, setChosen] = useState(null)

  const allFoods = useMemo(() => {
    const seen = new Set()
    return [...indianFoods, ...mockRecipes].filter((f) => {
      if (seen.has((f.name || '').toLowerCase())) return false
      seen.add((f.name || '').toLowerCase())
      return true
    })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return allFoods.slice(0, 60)
    const q = search.toLowerCase()
    return allFoods.filter((f) =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.category || '').toLowerCase().includes(q)
    ).slice(0, 60)
  }, [search, allFoods])

  if (!open) return null

  // Step 2: scope choice
  if (chosen) {
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{chosen.food_emoji || '🍽️'}</span>
            <div>
              <p className="font-bold text-gray-900 text-sm">{chosen.name}</p>
              <p className="text-xs text-gray-400">{chosen.nutrition?.calories || 0} kcal / 100g</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add to which days?</p>
          <div className="space-y-2.5">
            <button
              onClick={() => { onSelectDay(chosen); setChosen(null); setSearch('') }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">today</span>
              Add to this day only
            </button>
            <button
              onClick={() => { onSelectAllWeek(chosen); setChosen(null); setSearch('') }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-high border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
              Add to all 7 days this week
            </button>
          </div>
          <button onClick={() => setChosen(null)} className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 py-2">
            ← Back to food list
          </button>
        </div>
      </div>
    )
  }

  // Step 1: food selection
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Add to {mealSlot?.label || 'Meal'}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Search from 1,200+ Indian foods</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400" style={{ fontSize: '18px' }}>search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="idly, sambar, banana, paneer..." autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.map((food) => (
            <button key={food.id} onClick={() => setChosen(food)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left">
              <span className="text-2xl flex-shrink-0">{food.food_emoji || '🍽️'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{food.name}</p>
                <p className="text-xs text-gray-500">{food.category} · {food.nutrition?.calories || 0} kcal/100g</p>
              </div>
              <div className="flex gap-1 max-w-[80px] flex-wrap justify-end flex-shrink-0">
                {(food.health_tags || []).slice(0, 2).map((t) => (
                  <span key={t} className="text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5">{t}</span>
                ))}
              </div>
            </button>
          ))}
          {!filtered.length && (
            <div className="text-center py-10 text-gray-400">
              <span className="material-symbols-outlined block mb-2" style={{ fontSize: '40px' }}>search_off</span>
              <p className="text-sm">No foods found for "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Day Detail View ───────────────────────────────────────────────────────────

function DayDetailView({ dayIndex, weekPlan, weekKey, activeMealSlots, rda, skippedMap, onToggleSkip,
  onBack, onNavigate, onAddFoodDay, onAddFoodAllWeek, onRemoveFood, onChangePortionG, onMoveFood, onClearSlot, onClearDay }) {
  const day      = DAYS[dayIndex]
  const dayPlan  = weekPlan[day] || {}
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError,   setAiError]   = useState(null)
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)

  useEffect(() => { setAiResult(null); setAiError(null) }, [dayIndex])

  const dayNutrition = useMemo(() => getDayNutrition(dayPlan), [dayPlan])

  // Show active slots + any slot that has food in THIS day
  const sortedSlots = useMemo(() => {
    const ids = new Set(activeMealSlots.map((s) => s.id))
    MEAL_SLOTS_POOL.forEach(({ id }) => {
      if ((dayPlan[id]?.length || 0) > 0) ids.add(id)
    })
    return MEAL_SLOTS_POOL.filter((s) => ids.has(s.id)).sort((a, b) => a.timeOrder - b.timeOrder)
  }, [activeMealSlots, dayPlan])

  const totalFoods = sortedSlots.reduce((s, { id }) => s + (dayPlan[id]?.length || 0), 0)

  const allConflicts = useMemo(() => {
    const result = []
    sortedSlots.forEach(({ id, label }) => {
      const c = checkMealConflicts(dayPlan[id] || [])
      if (c.length) result.push({ slot: label, conflicts: c })
    })
    return result
  }, [dayPlan, sortedSlots])

  async function handleAI() {
    setAiLoading(true); setAiError(null)
    try {
      const r = await getAIDayAnalysis(DAY_FULL[dayIndex], dayPlan, activeMealSlots)
      r ? setAiResult(r) : setAiError('Add some foods first to get an AI analysis.')
    } catch (e) { setAiError(`Could not reach AI service. ${e.message}`) }
    finally { setAiLoading(false) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-xl text-gray-900">{DAY_FULL[dayIndex]}</h2>
          <p className="text-sm text-gray-500">{totalFoods} food{totalFoods !== 1 ? 's' : ''} · {dayNutrition.calories || 0} kcal total</p>
        </div>
        <button onClick={() => onClearDay(day)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
          <span className="material-symbols-outlined text-sm">delete_sweep</span>
          Clear day
        </button>
        <div className="flex gap-1">
          <button onClick={() => onNavigate(-1)} disabled={dayIndex === 0}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
          </button>
          <button onClick={() => onNavigate(1)} disabled={dayIndex === 6}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Meal slots */}
        <div className="lg:col-span-3 space-y-4">
          {sortedSlots.map(({ id, label, icon, color, bg }) => {
            const items      = dayPlan[id] || []
            const slotN      = getSlotNutrition(items)
            const conflicts  = checkMealConflicts(items)
            const isDragTarget = dragOverSlot?.slotId === id
            const isSkipped  = (skippedMap?.[day] || []).includes(id)

            // Skipped slot — collapsed display
            if (isSkipped) {
              return (
                <div key={id} className="bg-white rounded-2xl border border-dashed border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center opacity-40" style={{ background: bg }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color }}>{icon}</span>
                    </div>
                    <span className="text-sm text-gray-400 italic">{label} — skipped for {DAY_FULL[dayIndex].slice(0,3)}</span>
                  </div>
                  <button onClick={() => onToggleSkip(day, id)}
                    className="text-xs text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>undo</span>Restore
                  </button>
                </div>
              )
            }

            return (
              <div key={id}
                className={`bg-white rounded-2xl border overflow-hidden transition-colors ${isDragTarget ? 'border-primary border-2 bg-primary/5' : 'border-gray-100'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverSlot({ slotId: id }) }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragFrom && dragFrom.slotId !== id) {
                    onMoveFood(day, dragFrom.slotId, dragFrom.itemUid, day, id)
                  }
                  setDragFrom(null); setDragOverSlot(null)
                }}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color }}>{icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    {items.length > 0 && <p className="text-xs text-gray-400">{slotN.calories || 0} kcal · P {slotN.protein_g || 0}g</p>}
                  </div>
                  {/* Skip this slot for this day */}
                  {items.length === 0 && (
                    <button onClick={() => onToggleSkip(day, id)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title={`Hide ${label} for ${DAY_FULL[dayIndex]} only`}>
                      Skip day
                    </button>
                  )}
                  {items.length > 0 && (
                    <button onClick={() => onClearSlot(day, id)}
                      className="text-[10px] text-red-400 hover:text-red-600 px-2 py-0.5 rounded-lg hover:bg-red-50 transition-colors">
                      Clear
                    </button>
                  )}
                  {conflicts.length > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>{conflicts.length}
                    </span>
                  )}
                </div>

                {conflicts.length > 0 && (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                    {conflicts.slice(0, 2).map((c) => <p key={c.id} className="text-xs text-amber-700">⚠ {c.title} — {c.tip}</p>)}
                  </div>
                )}

                <div className="p-3 space-y-2"
                  onDragOver={(e) => { e.preventDefault(); setDragOverSlot({ slotId: id }) }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragFrom && dragFrom.slotId !== id) onMoveFood(day, dragFrom.slotId, dragFrom.itemUid, day, id)
                    setDragFrom(null); setDragOverSlot(null)
                  }}>
                  {!items.length && <p className="text-xs text-gray-400 text-center py-3">No foods — drag here or use buttons below</p>}
                  {items.map((item) => (
                    <FoodItemRow key={item.uid} item={item} draggable
                      onDragStart={() => setDragFrom({ slotId: id, itemUid: item.uid })}
                      onRemove={(uid) => onRemoveFood(day, id, uid)}
                      onChangePortionG={(uid, p) => onChangePortionG(day, id, uid, p)} />
                  ))}
                  {/* Two add buttons: this day / all week */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => onAddFoodDay(day, id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-primary font-medium py-2 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                      Add to {DAY_FULL[dayIndex].slice(0, 3)}
                    </button>
                    <button onClick={() => onAddFoodAllWeek(id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-500 font-medium py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all"
                      title="Adds to same slot across all 7 days">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_view_week</span>
                      All 7 days
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nutrition + AI */}
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
                const sc = { Optimal: '#10b981', Adequate: '#f59e0b', Low: '#f97316', Deficient: '#ef4444' }[status]
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{val}{unit}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ color: sc, background: sc + '20' }}>{status}</span>
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

          {/* AI Analysis */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>auto_awesome</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 text-sm">AI Diet Analysis</h3>
                <p className="text-xs text-gray-400">Powered by AarogyaAI · Llama 3.3 70B</p>
              </div>
            </div>
            {!aiResult && !aiLoading && !aiError && (
              <button onClick={handleAI} disabled={totalFoods === 0}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
                {totalFoods === 0 ? 'Add foods first' : "Analyse this day's diet"}
              </button>
            )}
            {aiLoading && (
              <div className="flex items-center gap-3 py-4 text-gray-500">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
                <span className="text-sm">Analysing meal plan...</span>
              </div>
            )}
            {aiError && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{aiError}</div>}
            {aiResult && (
              <div>
                <div className="max-h-80 overflow-y-auto space-y-1.5">{renderAIText(aiResult)}</div>
                <button onClick={() => { setAiResult(null); setAiError(null) }}
                  className="mt-3 text-xs text-primary hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>Re-analyse
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
  const profile  = useProfileStore((s) => s.profile)
  const rda      = useMemo(() => getRDAForProfile(profile), [profile])

  const { weekPlan, weekPlans, mealCount, skippedSlots, addItem, addItemAllDays, removeItem,
    updatePortion, moveItem, clearSlot, clearDay, resetWeek, setMealCount, toggleSkipSlot } = useMealPlanStore()

  // ── Week navigation ──────────────────────────────────────────────────────
  const [viewWeekOffset, setViewWeekOffset] = useState(0)
  const viewMondayKey = useMemo(() => getMondayKey(viewWeekOffset), [viewWeekOffset])
  const viewWeekDates = useMemo(() => getWeekDates(viewMondayKey), [viewMondayKey])
  const todayDayIndex = useMemo(() => getTodayDayIndex(viewMondayKey), [viewMondayKey])

  // Active plan: offset 0 = weekPlan (current week), else weekPlans[key]
  const activePlan = useMemo(() =>
    viewWeekOffset === 0 ? weekPlan : (weekPlans[viewMondayKey] ?? buildEmptyFromStore()),
  [viewWeekOffset, weekPlan, weekPlans, viewMondayKey])

  function buildEmptyFromStore() {
    const plan = {}
    DAYS.forEach((day) => {
      plan[day] = {}
      MEAL_SLOTS_POOL.forEach(({ id }) => { plan[day][id] = [] })
    })
    return plan
  }

  // weekKey to pass to store actions (null = current week, string = other week)
  const weekKey = viewWeekOffset === 0 ? null : viewMondayKey

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState('planner')
  const [selectedDay,   setSelectedDay]   = useState(0)
  const [pickerOpen,    setPickerOpen]    = useState(null)  // { day, slotId }
  const [activeDayView, setActiveDayView] = useState(null)
  const [groceryChecked, setGroceryChecked] = useState({})

  // Drag state (weekly grid)
  const [dragGrid, setDragGrid]     = useState(null) // { day, slotId, itemUid }
  const [dropTarget, setDropTarget] = useState(null) // { day, slotId }

  // ── Fix corrupted mealCount ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof mealCount !== 'number' || isNaN(mealCount) || mealCount < 2 || mealCount > 6) {
      setMealCount(4)
    }
  }, []) // eslint-disable-line

  const safeMealCount = (typeof mealCount === 'number' && !isNaN(mealCount) && mealCount >= 2 && mealCount <= 6) ? mealCount : 4

  const activeMealSlots = useMemo(() =>
    SLOT_PRIORITY.slice(0, safeMealCount).map((id) => MEAL_SLOTS_POOL.find((s) => s.id === id)).filter(Boolean),
  [safeMealCount])

  // Key used to look up skippedSlots for this week
  const skippedKey = viewWeekOffset === 0 ? 'current' : viewMondayKey
  const skippedMap = skippedSlots[skippedKey] || {}

  // Weekly grid shows active slots PLUS any slot that has food in any day
  const gridVisibleSlots = useMemo(() => {
    const activeIds = new Set(activeMealSlots.map((s) => s.id))
    DAYS.forEach((day) => {
      MEAL_SLOTS_POOL.forEach(({ id }) => {
        if ((activePlan[day]?.[id]?.length || 0) > 0) activeIds.add(id)
      })
    })
    return MEAL_SLOTS_POOL.filter((s) => activeIds.has(s.id))
  }, [activeMealSlots, activePlan])

  const handleToggleSkip = useCallback((day, slotId) => {
    toggleSkipSlot(day, slotId, viewWeekOffset === 0 ? null : viewMondayKey)
  }, [toggleSkipSlot, viewWeekOffset, viewMondayKey])

  // ── Store action wrappers (pass weekKey) ─────────────────────────────────
  const addFood = useCallback((food, day, slotId) => {
    addItem(day, slotId, food, SUGGESTED_PORTIONS[slotId] || 200, weekKey)
    setPickerOpen(null)
  }, [addItem, weekKey])

  const addFoodAllWeek = useCallback((food, slotId) => {
    addItemAllDays(slotId, food, SUGGESTED_PORTIONS[slotId] || 200, weekKey)
    setPickerOpen(null)
  }, [addItemAllDays, weekKey])

  const removeFood = useCallback((day, slotId, itemUid) => {
    removeItem(day, slotId, itemUid, weekKey)
  }, [removeItem, weekKey])

  const changePortionG = useCallback((day, slotId, itemUid, portion) => {
    updatePortion(day, slotId, itemUid, portion, weekKey)
  }, [updatePortion, weekKey])

  const handleMoveFood = useCallback((fromDay, fromSlot, itemUid, toDay, toSlot) => {
    moveItem(fromDay, fromSlot, itemUid, toDay, toSlot, weekKey)
  }, [moveItem, weekKey])

  const handleClearSlot = useCallback((day, slotId) => {
    clearSlot(day, slotId, weekKey)
  }, [clearSlot, weekKey])

  const handleClearDay = useCallback((day) => {
    if (window.confirm(`Clear all meals for ${DAY_FULL[DAYS.indexOf(day)]}?`)) {
      clearDay(day, weekKey)
    }
  }, [clearDay, weekKey])

  const clearEntireWeek = useCallback(() => {
    if (window.confirm('Clear all meals for this entire week?')) {
      resetWeek(weekKey)
    }
  }, [resetWeek, weekKey])

  // ── Computed ─────────────────────────────────────────────────────────────
  const weeklyAnalysisData = useMemo(() =>
    DAYS.map((day) => {
      const dn = getDayNutrition(activePlan[day])
      return { day, calories: dn.calories || 0, protein: dn.protein_g || 0 }
    }),
  [activePlan])

  const groceryGroups     = useMemo(() => aggregateGrocery(activePlan), [activePlan])
  const selectedDayNutrition = useMemo(() => getDayNutrition(activePlan[DAYS[selectedDay]]), [activePlan, selectedDay])

  // Format week date range for header
  const weekLabel = useMemo(() => {
    const from = viewWeekDates[0]
    const to   = viewWeekDates[6]
    const opts = { month: 'short', day: 'numeric' }
    if (from.getFullYear() !== to.getFullYear())
      return `${from.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })} – ${to.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`
    if (from.getMonth() !== to.getMonth())
      return `${from.toLocaleDateString('en-IN', opts)} – ${to.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`
    return `${from.toLocaleDateString('en-IN', opts)} – ${to.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`
  }, [viewWeekDates])

  const isCurrentWeek = viewWeekOffset === 0

  return (
    <div className="min-h-screen bg-surface">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-on-surface">Weekly Meal Planner</h1>
            <p className="text-xs text-gray-500">Click a day to plan & analyse · ICMR-RDA tracking</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Week navigation */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
              <button onClick={() => setViewWeekOffset((o) => o - 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              <div className="text-center min-w-[130px]">
                <p className="text-xs font-semibold text-gray-700">{weekLabel}</p>
                {isCurrentWeek && <p className="text-[10px] text-primary font-medium">This week</p>}
                {!isCurrentWeek && (
                  <button onClick={() => setViewWeekOffset(0)} className="text-[10px] text-primary hover:underline">
                    Back to this week
                  </button>
                )}
              </div>
              <button onClick={() => setViewWeekOffset((o) => o + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>

            {/* Meals/day */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-medium text-gray-600">Meals/day</span>
              <button onClick={() => setMealCount(Math.max(2, safeMealCount - 1))} disabled={safeMealCount <= 2}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
              </button>
              <span className="text-sm font-bold text-primary w-4 text-center">{safeMealCount}</span>
              <button onClick={() => setMealCount(Math.min(6, safeMealCount + 1))} disabled={safeMealCount >= 6}
                className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
              </button>
            </div>

            <button onClick={clearEntireWeek}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
              Clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[
            { id: 'planner',  label: 'Planner',     icon: 'calendar_month' },
            { id: 'analysis', label: 'Nutrition',    icon: 'bar_chart' },
            { id: 'grocery',  label: 'Grocery List', icon: 'shopping_basket' },
          ].map(({ id, label, icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); if (id !== 'planner') setActiveDayView(null) }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── PLANNER TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'planner' && (
          <>
            {activeDayView !== null ? (
              <DayDetailView
                dayIndex={activeDayView}
                weekPlan={activePlan}
                weekKey={weekKey}
                activeMealSlots={activeMealSlots}
                rda={rda}
                skippedMap={skippedMap}
                onToggleSkip={handleToggleSkip}
                onBack={() => setActiveDayView(null)}
                onNavigate={(dir) => setActiveDayView((i) => Math.min(6, Math.max(0, i + dir)))}
                onAddFoodDay={(day, slotId) => setPickerOpen({ day, slotId })}
                onAddFoodAllWeek={(slotId) => setPickerOpen({ day: DAYS[activeDayView], slotId, allWeek: true })}
                onRemoveFood={removeFood}
                onChangePortionG={changePortionG}
                onMoveFood={handleMoveFood}
                onClearSlot={handleClearSlot}
                onClearDay={handleClearDay}
              />
            ) : (
              /* ── WEEKLY GRID ── */
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="min-w-[960px]">
                  {/* Day headers with real dates */}
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    <div className="text-xs font-semibold text-gray-400 px-2 py-1">Meal</div>
                    {DAYS.map((day, i) => {
                      const dayN = getDayNutrition(activePlan[day])
                      const calPct = Math.min(100, Math.round(((dayN.calories || 0) / (rda.calories || 2000)) * 100))
                      const totalItems = activeMealSlots.reduce((s, { id }) => s + (activePlan[day]?.[id]?.length || 0), 0)
                      const isToday = i === todayDayIndex
                      const dateObj = viewWeekDates[i]
                      return (
                        <div key={day} className="relative">
                          <button onClick={() => setActiveDayView(i)}
                            className={`w-full text-left p-2 rounded-xl transition-all border group
                              ${isToday
                                ? 'bg-primary/10 border-primary/30 hover:bg-primary/15'
                                : 'hover:bg-white hover:shadow-sm border-transparent hover:border-primary/20'}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-bold transition-colors ${isToday ? 'text-primary' : 'text-gray-800 group-hover:text-primary'}`}>
                                  {day}
                                  {isToday && <span className="ml-1.5 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">Today</span>}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                              <span className="material-symbols-outlined text-gray-300 group-hover:text-primary text-sm">chevron_right</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{dayN.calories || 0} kcal</p>
                            <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${calPct}%` }} />
                            </div>
                            {totalItems > 0 && <p className="text-xs text-gray-400 mt-0.5">{totalItems} food{totalItems !== 1 ? 's' : ''}</p>}
                          </button>
                          {/* Clear day button */}
                          {(activePlan[day] && DAYS.some(() => activeMealSlots.some(({ id }) => (activePlan[day][id]?.length || 0) > 0))) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleClearDay(day) }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-100 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10"
                              title={`Clear ${day}`}>
                              <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Meal rows — shows active slots + any slot with food */}
                  {gridVisibleSlots.map(({ id: slotId, label, icon, color, bg }) => (
                    <div key={slotId} className="grid grid-cols-8 gap-2 mb-2">
                      {/* Slot label */}
                      <div className="flex items-center gap-2 px-2 py-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color }}>{icon}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 leading-tight">{label}</p>
                      </div>

                      {/* One cell per day */}
                      {DAYS.map((day) => {
                        const items      = activePlan[day]?.[slotId] || []
                        const slotN      = getSlotNutrition(items)
                        const isSkipped  = (skippedMap[day] || []).includes(slotId)
                        const isDropTarget = dropTarget?.day === day && dropTarget?.slotId === slotId

                        // Skipped cell
                        if (isSkipped) {
                          return (
                            <div key={day} className="rounded-xl border border-dashed border-gray-200 p-2 min-h-[90px] flex flex-col items-center justify-center gap-1 bg-gray-50/50">
                              <span className="text-[10px] text-gray-300 italic">Skipped</span>
                              <button onClick={() => handleToggleSkip(day, slotId)}
                                className="text-[10px] text-primary hover:underline">Restore</button>
                            </div>
                          )
                        }

                        return (
                          <div key={day}
                            className={`rounded-xl border p-2 min-h-[90px] flex flex-col gap-1 transition-colors ${
                              isDropTarget ? 'border-primary border-2 bg-primary/5' : 'bg-white border-gray-100'}`}
                            onDragOver={(e) => { e.preventDefault(); setDropTarget({ day, slotId }) }}
                            onDragLeave={() => setDropTarget(null)}
                            onDrop={(e) => {
                              e.preventDefault()
                              if (dragGrid) handleMoveFood(dragGrid.day, dragGrid.slotId, dragGrid.itemUid, day, slotId)
                              setDragGrid(null); setDropTarget(null)
                            }}>

                            {items.length > 0 ? (
                              <>
                                <div className="flex flex-col gap-1 flex-1">
                                  {items.slice(0, 3).map((item) => (
                                    <div key={item.uid}
                                      className="flex items-center gap-1 text-xs text-gray-700 bg-gray-50 rounded-lg px-1.5 py-0.5 cursor-grab group/chip"
                                      draggable
                                      onDragStart={() => setDragGrid({ day, slotId, itemUid: item.uid })}>
                                      <span className="text-sm leading-none flex-shrink-0">{item.food?.food_emoji || '🍽️'}</span>
                                      <span className="truncate flex-1">{item.food?.name}</span>
                                      <button onClick={(e) => { e.stopPropagation(); removeFood(day, slotId, item.uid) }}
                                        className="flex-shrink-0 w-3.5 h-3.5 rounded-full text-red-400 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover/chip:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>close</span>
                                      </button>
                                    </div>
                                  ))}
                                  {items.length > 3 && <p className="text-xs text-gray-400 pl-1">+{items.length - 3} more</p>}
                                </div>
                                <p className="text-xs text-gray-400">{slotN.calories || 0} kcal</p>
                              </>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                                <span className="text-xs text-gray-300">Empty</span>
                                {/* Skip option for empty slots */}
                                <button onClick={() => handleToggleSkip(day, slotId)}
                                  className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors leading-none"
                                  title={`Skip ${label} for ${day}`}>
                                  Skip
                                </button>
                              </div>
                            )}

                            {!isSkipped && (
                              <button onClick={() => setPickerOpen({ day, slotId })}
                                className="flex items-center justify-center gap-0.5 text-xs text-primary font-medium py-1 rounded-lg hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add</span>Add
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}

                  <p className="text-xs text-gray-400 mt-3 text-center">
                    {safeMealCount} meals shown: {activeMealSlots.map((s) => s.label).join(', ')} ·
                    <button onClick={() => setActiveDayView(todayDayIndex >= 0 ? todayDayIndex : 0)}
                      className="text-primary hover:underline ml-1">
                      Click any day to edit & analyse
                    </button>
                    {' · '}
                    <span className="italic text-gray-300">Drag chips to move between days/slots</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ANALYSIS TAB ────────────────────────────────────────────────── */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DAYS.map((day, i) => (
                <button key={day} onClick={() => setSelectedDay(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedDay === i ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
                  <span>{day}</span>
                  {i === todayDayIndex && <span className="ml-1 text-[10px] opacity-70">•</span>}
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
                    {weeklyAnalysisData.map((_, i) => (
                      <Cell key={i} fill={i === selectedDay ? '#154212' : i === todayDayIndex ? '#2d5a27' : '#bcf0ae'} />
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
              <h3 className="font-semibold text-gray-700 mb-4">{DAY_FULL[selectedDay]} — Micronutrients</h3>
              <div className="space-y-3">
                {MICRO_NUTRIENTS.map(({ key, label, unit, color, icon }) => {
                  const val = selectedDayNutrition[key] || 0
                  const rdaVal = rda[key] || DEFAULT_RDA[key] || 1
                  const pct = Math.min(100, Math.round((val / rdaVal) * 100))
                  const status = pct >= 90 ? 'Optimal' : pct >= 60 ? 'Adequate' : pct >= 30 ? 'Low' : 'Deficient'
                  const sc = { Optimal: '#10b981', Adequate: '#f59e0b', Low: '#f97316', Deficient: '#ef4444' }[status]
                  return (
                    <div key={key} className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color }}>{icon}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-700 truncate">{label}</span>
                      </div>
                      <div className="col-span-5">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                      <div className="col-span-2 text-xs text-gray-500 text-right">{val}{unit}</div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: sc, background: sc + '20' }}>{status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── GROCERY TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'grocery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Weekly Grocery List</h2>
                <p className="text-sm text-gray-500">Auto-generated from your meal plan · {weekLabel}</p>
              </div>
              <button onClick={() => {
                const lines = []
                GROCERY_CATS.forEach((cat) => {
                  const items = groceryGroups[cat] || []
                  if (items.length) { lines.push(`\n${cat}:`); items.forEach((i) => lines.push(`  - ${i.name}: ${Math.round(i.qty)}g`)) }
                })
                navigator.clipboard?.writeText(lines.join('\n'))
              }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>Copy List
              </button>
            </div>
            {!Object.values(groceryGroups).flat().length ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <span className="material-symbols-outlined text-gray-300 block mb-3" style={{ fontSize: '48px' }}>shopping_basket</span>
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
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>category</span>
                        {cat}
                        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 ml-auto">{items.length}</span>
                      </h3>
                      <div className="space-y-2">
                        {items.map((item) => {
                          const key = item.name.toLowerCase()
                          return (
                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={!!groceryChecked[key]}
                                onChange={(e) => setGroceryChecked((p) => ({ ...p, [key]: e.target.checked }))}
                                className="w-4 h-4 rounded accent-primary" />
                              <span className={`text-sm flex-1 ${groceryChecked[key] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.name}</span>
                              <span className="text-xs text-gray-400">{Math.round(item.qty)}g</span>
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

      {/* Food Picker Modal */}
      <RecipePickerModal
        open={!!pickerOpen}
        onClose={() => setPickerOpen(null)}
        mealSlot={pickerOpen ? MEAL_SLOTS_POOL.find((s) => s.id === pickerOpen.slotId) : null}
        onSelectDay={(food) => {
          if (pickerOpen) addFood(food, pickerOpen.day, pickerOpen.slotId)
        }}
        onSelectAllWeek={(food) => {
          if (pickerOpen) addFoodAllWeek(food, pickerOpen.slotId)
        }}
      />
    </div>
  )
}
