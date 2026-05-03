/**
 * Meal Plan Store — multi-week Zustand store with localStorage persistence.
 * Supports current week (weekPlan) + any future/past week (weekPlans[key]).
 * All actions accept an optional weekKey; null/undefined = current week.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const MEAL_SLOTS_POOL = [
  { id: 'breakfast',     label: 'Breakfast',     icon: 'wb_sunny',       color: '#f59e0b', bg: '#fef3c7', timeOrder: 1, defaultPortion: 300 },
  { id: 'morning_snack', label: 'Morning Snack',  icon: 'free_breakfast', color: '#ec4899', bg: '#fce7f3', timeOrder: 2, defaultPortion: 150 },
  { id: 'lunch',         label: 'Lunch',          icon: 'restaurant',     color: '#10b981', bg: '#d1fae5', timeOrder: 3, defaultPortion: 400 },
  { id: 'snack',         label: 'Snack',          icon: 'local_cafe',     color: '#8b5cf6', bg: '#ede9fe', timeOrder: 4, defaultPortion: 150 },
  { id: 'dinner',        label: 'Dinner',         icon: 'nights_stay',    color: '#3b82f6', bg: '#dbeafe', timeOrder: 5, defaultPortion: 350 },
  { id: 'post_dinner',   label: 'Post-Dinner',    icon: 'bedtime',        color: '#6b7280', bg: '#f3f4f6', timeOrder: 6, defaultPortion: 100 },
]

const SLOT_IDS = MEAL_SLOTS_POOL.map((s) => s.id)

let _uid = 0
const uid = () => `item_${++_uid}_${Date.now()}`

function buildEmpty() {
  const plan = {}
  DAYS.forEach((day) => {
    plan[day] = {}
    SLOT_IDS.forEach((id) => { plan[day][id] = [] })
  })
  return plan
}

// ─── Date utilities (exported for use in components) ──────────────────────────

/** Returns "YYYY-MM-DD" for the Monday of the week `weekOffset` weeks from today. */
export function getMondayKey(weekOffset = 0) {
  const d = new Date()
  const day = d.getDay() // 0=Sun
  const daysToMon = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + daysToMon + weekOffset * 7)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

/** Returns an array of 7 Date objects (Mon–Sun) for the given Monday key. */
export function getWeekDates(mondayKey) {
  const monday = new Date(mondayKey + 'T00:00:00')
  return DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

/** Returns "YYYY-MM-DD" for a given Date. */
export function dateKey(d) {
  return d.toISOString().slice(0, 10)
}

/** Returns today's DAYS index (Mon=0 … Sun=6), or -1 if not this week. */
export function getTodayDayIndex(mondayKey) {
  const today = dateKey(new Date())
  const dates  = getWeekDates(mondayKey)
  return dates.findIndex((d) => dateKey(d) === today)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMealPlanStore = create(
  persist(
    (set, get) => ({
      // Current week (backward-compat: ChatbotPage, AddToPlanModal, Dashboard all use this)
      weekPlan:  buildEmpty(),
      // Future / past weeks keyed by Monday date string
      weekPlans: {},
      mealCount: 4,
      // Per-day skipped slots: { weekKey_or_'current': { day: [slotId, ...] } }
      skippedSlots: {},

      // ── Internal helper ──────────────────────────────────────────────────
      _plan:  (weekKey) => weekKey ? (get().weekPlans[weekKey] ?? buildEmpty()) : get().weekPlan,
      _setPlan: (weekKey, plan) => weekKey
        ? set((s) => ({ weekPlans: { ...s.weekPlans, [weekKey]: plan } }))
        : set({ weekPlan: plan }),

      // ── Add one item to a specific day + slot ─────────────────────────────
      addItem: (day, slotId, food, portion_g = 250, weekKey = null) =>
        set((s) => {
          const base = weekKey ? (s.weekPlans[weekKey] ?? buildEmpty()) : s.weekPlan
          const dayPlan = base[day] ?? {}
          const slot    = dayPlan[slotId] ?? []
          const updated = { ...base, [day]: { ...dayPlan, [slotId]: [...slot, { uid: uid(), food, portion_g }] } }
          return weekKey ? { weekPlans: { ...s.weekPlans, [weekKey]: updated } } : { weekPlan: updated }
        }),

      // ── Add same item to ALL 7 days in a slot (template / repeat) ─────────
      addItemAllDays: (slotId, food, portion_g = 250, weekKey = null) =>
        set((s) => {
          const base = weekKey ? (s.weekPlans[weekKey] ?? buildEmpty()) : s.weekPlan
          const updated = { ...base }
          DAYS.forEach((day) => {
            const dp = updated[day] ?? {}
            updated[day] = { ...dp, [slotId]: [...(dp[slotId] ?? []), { uid: uid(), food, portion_g }] }
          })
          return weekKey ? { weekPlans: { ...s.weekPlans, [weekKey]: updated } } : { weekPlan: updated }
        }),

      // ── Remove one item ───────────────────────────────────────────────────
      removeItem: (day, slotId, itemUid, weekKey = null) =>
        set((s) => {
          const base = weekKey ? (s.weekPlans[weekKey] ?? buildEmpty()) : s.weekPlan
          const updated = {
            ...base,
            [day]: { ...base[day], [slotId]: (base[day]?.[slotId] ?? []).filter((i) => i.uid !== itemUid) },
          }
          return weekKey ? { weekPlans: { ...s.weekPlans, [weekKey]: updated } } : { weekPlan: updated }
        }),

      // ── Update portion ────────────────────────────────────────────────────
      updatePortion: (day, slotId, itemUid, portion_g, weekKey = null) =>
        set((s) => {
          const base = weekKey ? (s.weekPlans[weekKey] ?? buildEmpty()) : s.weekPlan
          const updated = {
            ...base,
            [day]: {
              ...base[day],
              [slotId]: (base[day]?.[slotId] ?? []).map((i) => i.uid === itemUid ? { ...i, portion_g } : i),
            },
          }
          return weekKey ? { weekPlans: { ...s.weekPlans, [weekKey]: updated } } : { weekPlan: updated }
        }),

      // ── Move item between slots / days (drag & drop) ──────────────────────
      moveItem: (fromDay, fromSlotId, itemUid, toDay, toSlotId, weekKey = null) =>
        set((s) => {
          const base = weekKey ? (s.weekPlans[weekKey] ?? buildEmpty()) : s.weekPlan
          const fromSlot = base[fromDay]?.[fromSlotId] ?? []
          const item     = fromSlot.find((i) => i.uid === itemUid)
          if (!item) return s
          const toSlot = base[toDay]?.[toSlotId] ?? []
          const updated = {
            ...base,
            [fromDay]: { ...base[fromDay], [fromSlotId]: fromSlot.filter((i) => i.uid !== itemUid) },
            [toDay]:   { ...base[toDay],   [toSlotId]:   [...toSlot, { ...item, uid: uid() }] },
          }
          return weekKey ? { weekPlans: { ...s.weekPlans, [weekKey]: updated } } : { weekPlan: updated }
        }),

      // ── Clear one slot ────────────────────────────────────────────────────
      clearSlot: (day, slotId, weekKey = null) =>
        set((s) => {
          const base = weekKey ? (s.weekPlans[weekKey] ?? buildEmpty()) : s.weekPlan
          const updated = { ...base, [day]: { ...base[day], [slotId]: [] } }
          return weekKey ? { weekPlans: { ...s.weekPlans, [weekKey]: updated } } : { weekPlan: updated }
        }),

      // ── Clear one day ─────────────────────────────────────────────────────
      clearDay: (day, weekKey = null) =>
        set((s) => {
          const base    = weekKey ? (s.weekPlans[weekKey] ?? buildEmpty()) : s.weekPlan
          const cleared = Object.fromEntries(SLOT_IDS.map((id) => [id, []]))
          const updated = { ...base, [day]: cleared }
          return weekKey ? { weekPlans: { ...s.weekPlans, [weekKey]: updated } } : { weekPlan: updated }
        }),

      // ── Reset an entire week ──────────────────────────────────────────────
      resetWeek: (weekKey = null) =>
        set((s) => {
          if (!weekKey) return { weekPlan: buildEmpty() }
          const { [weekKey]: _, ...rest } = s.weekPlans
          return { weekPlans: rest }
        }),

      // ── Per-day slot skip (hide a slot for one specific day) ─────────────
      toggleSkipSlot: (day, slotId, weekKey = null) =>
        set((s) => {
          const key      = weekKey || 'current'
          const existing = s.skippedSlots[key]?.[day] || []
          const newList  = existing.includes(slotId)
            ? existing.filter((id) => id !== slotId)
            : [...existing, slotId]
          return {
            skippedSlots: {
              ...s.skippedSlots,
              [key]: { ...(s.skippedSlots[key] || {}), [day]: newList },
            },
          }
        }),

      isSlotSkipped: (day, slotId, weekKey = null) => {
        const key = weekKey || 'current'
        return (get().skippedSlots[key]?.[day] || []).includes(slotId)
      },

      // ── Replace current weekPlan (e.g. AI-generated) ─────────────────────
      setWeekPlan: (plan) => set({ weekPlan: plan }),

      // ── Meal slot count (2–6) ─────────────────────────────────────────────
      setMealCount: (countOrFn) =>
        set((s) => {
          const next = typeof countOrFn === 'function' ? countOrFn(s.mealCount) : countOrFn
          return { mealCount: Math.min(6, Math.max(2, Number(next) || 4)) }
        }),
    }),
    { name: 'aarogya-meal-plan' }
  )
)
