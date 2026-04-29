/**
 * AddToPlanModal — reusable "Add to Meal Plan" modal
 * Accepts any food / recipe / supplement item and lets the user pick:
 *   Day → Meal Slot → Portion (grams or serving)
 * Then writes to the shared mealPlanStore.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMealPlanStore, DAYS, DAY_FULL, MEAL_SLOTS_POOL } from '../../store/mealPlanStore'

export default function AddToPlanModal({ item, onClose }) {
  const navigate  = useNavigate()
  const { addItem } = useMealPlanStore()

  const [day,     setDay]     = useState('Mon')
  const [slotId,  setSlotId]  = useState('lunch')
  const [portion, setPortion] = useState(250)
  const [added,   setAdded]   = useState(false)

  if (!item) return null

  const slot = MEAL_SLOTS_POOL.find((s) => s.id === slotId)
  const n    = item.nutrition || {}
  const cal  = Math.round((n.calories  || 0) * portion / 100)
  const prot = Math.round((n.protein_g || 0) * portion / 100 * 10) / 10
  const carb = Math.round((n.carbs_g   || 0) * portion / 100 * 10) / 10
  const fat  = Math.round((n.fat_g     || 0) * portion / 100 * 10) / 10

  const handleAdd = () => {
    addItem(day, slotId, item, portion)
    setAdded(true)
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (added) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center py-4">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Added to Plan!</h3>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-primary">{item.name}</span>
            &nbsp;→ {DAY_FULL[DAYS.indexOf(day)]} · {slot?.label}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Continue
            </button>
            <button
              onClick={() => { onClose(); navigate('/meal-planner') }}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              View Plan
            </button>
          </div>
        </div>
      </Overlay>
    )
  }

  // ── Picker state ──────────────────────────────────────────────────────────
  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl flex-shrink-0">{item.food_emoji || item.emoji || '🍽️'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {n.calories ? `${n.calories} kcal` : ''}{n.protein_g ? ` · ${n.protein_g}g protein` : ''} per 100g
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Day selector */}
      <Label text="Select Day" />
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {DAYS.map((d, i) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              day === d
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Meal slot selector */}
      <Label text="Select Meal" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {MEAL_SLOTS_POOL.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSlotId(s.id); setPortion(s.defaultPortion) }}
            className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
              slotId === s.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{s.icon}</span>
            <span className="leading-none text-center">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Portion picker */}
      <Label text="Portion (grams)" />
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setPortion((p) => Math.max(25, p - 25))}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
        </button>
        <div className="flex-1 text-center">
          <span className="text-2xl font-bold text-gray-900">{portion}</span>
          <span className="text-sm text-gray-400 ml-1">g</span>
        </div>
        <button
          onClick={() => setPortion((p) => p + 25)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        </button>
      </div>

      {/* Macro preview */}
      <div className="flex gap-2 mb-5 p-3 bg-gray-50 rounded-2xl">
        {[
          { label: 'Calories', value: `${cal}`, unit: 'kcal', color: 'text-red-500' },
          { label: 'Protein',  value: `${prot}`, unit: 'g',   color: 'text-violet-500' },
          { label: 'Carbs',    value: `${carb}`, unit: 'g',   color: 'text-amber-500' },
          { label: 'Fat',      value: `${fat}`,  unit: 'g',   color: 'text-blue-500' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="flex-1 text-center">
            <p className={`text-sm font-bold ${color}`}>{value}<span className="text-[10px] font-normal ml-0.5">{unit}</span></p>
            <p className="text-[10px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        className="w-full py-3.5 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
      >
        Add to {DAY_FULL[DAYS.indexOf(day)]} · {slot?.label}
      </button>
    </Overlay>
  )
}

// ── Shared overlay wrapper ─────────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {children}
      </div>
    </div>
  )
}

// ── Small label ────────────────────────────────────────────────────────────────
function Label({ text }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{text}</p>
}
