/**
 * Meal Plan Store — shared Zustand store with localStorage persistence
 * Used by MealPlannerPage, RecipeDetailPage, SupplementsPage, ChatbotPage
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

export const useMealPlanStore = create(
  persist(
    (set) => ({
      weekPlan: buildEmpty(),
      mealCount: 4,

      /** Add a food/recipe/supplement item to a specific day + meal slot */
      addItem: (day, slotId, food, portion_g = 250) =>
        set((state) => {
          const dayPlan = state.weekPlan[day] || {}
          const slot = dayPlan[slotId] || []
          return {
            weekPlan: {
              ...state.weekPlan,
              [day]: { ...dayPlan, [slotId]: [...slot, { uid: uid(), food, portion_g }] },
            },
          }
        }),

      /** Remove an item by its uid */
      removeItem: (day, slotId, itemUid) =>
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [day]: {
              ...state.weekPlan[day],
              [slotId]: (state.weekPlan[day][slotId] || []).filter((i) => i.uid !== itemUid),
            },
          },
        })),

      /** Update portion size for an item */
      updatePortion: (day, slotId, itemUid, portion_g) =>
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [day]: {
              ...state.weekPlan[day],
              [slotId]: (state.weekPlan[day][slotId] || []).map((i) =>
                i.uid === itemUid ? { ...i, portion_g } : i
              ),
            },
          },
        })),

      /** Set number of active meal slots (2–6) */
      setMealCount: (count) => set({ mealCount: Math.min(6, Math.max(2, count)) }),

      /** Clear one day */
      clearDay: (day) =>
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [day]: Object.fromEntries(SLOT_IDS.map((id) => [id, []])),
          },
        })),

      /** Replace entire weekPlan (e.g. AI-generated plan) */
      setWeekPlan: (weekPlan) => set({ weekPlan }),

      /** Full reset */
      resetWeek: () => set({ weekPlan: buildEmpty() }),
    }),
    { name: 'aarogya-meal-plan' }
  )
)
