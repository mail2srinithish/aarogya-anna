import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useProfileStore }               from '../store/profileStore'
import { useRecipeStore }                from '../store/recipeStore'
import { useMealPlanStore, DAYS, MEAL_SLOTS_POOL } from '../store/mealPlanStore'
import { getRDA, getRDAPercent }         from '../utils/rda'
import { getGILabel }                    from '../utils/healthScore'
import { getCurrentSeason }              from '../utils/seasonDetector'
import { getBMICategory }                from '../utils/bmi'
import { mockUserProfile }               from '../data/mockRecipes'

// ─── Constants ────────────────────────────────────────────────────────────────

const CIRCUMFERENCE = 351.85  // 2 * π * 56

const AYURVEDIC_MSG = {
  'Normal / Healthy': 'Your body weight is in a healthy range. Maintain with seasonal, balanced Indian meals.',
  'Underweight':      'Focus on nourishing, calorie-dense foods: ghee, nuts, whole grains, and lentil-based dishes.',
  'Overweight':       'Favour light, warm meals. Millets, leafy greens, and warm-water fasting help balance metabolism.',
  'Obese I':          'Prioritise high-fiber, low-GI foods: ragi, brown rice, daliya, and leafy greens.',
  'Obese II':         'Consult a registered dietitian for a personalised calorie-deficit plan.',
}

// Micronutrients actually stored in foodsDb nutrition objects
const MICRONUTRIENT_CONFIG = [
  { key: 'iron_mg',         label: 'Iron',      unit: 'mg',  icon: 'opacity',    color: '#d63c1a', bg: '#fff0ec', tracked: true  },
  { key: 'calcium_mg',      label: 'Calcium',   unit: 'mg',  icon: 'nutrition',  color: '#1a63a8', bg: '#e8f2ff', tracked: true  },
  { key: 'vitamin_d_mcg',   label: 'Vitamin D', unit: 'mcg', icon: 'wb_sunny',   color: '#d49400', bg: '#fff9e6', tracked: true  },
  { key: 'vitamin_b12_mcg', label: 'B12',       unit: 'mcg', icon: 'science',    color: '#7a2a8a', bg: '#f7eeff', tracked: true  },
  { key: 'folate_mcg',      label: 'Folate',    unit: 'mcg', icon: 'eco',        color: '#2a7a3a', bg: '#eefff0', tracked: true  },
  { key: 'magnesium_mg',    label: 'Magnesium', unit: 'mg',  icon: 'bolt',       color: '#3a6aa8', bg: '#eef4ff', tracked: true  },
  { key: 'zinc_mg',         label: 'Zinc',      unit: 'mg',  icon: 'security',   color: '#5a7a1a', bg: '#f2f9e6', tracked: true  },
  { key: 'vitamin_c_mg',    label: 'Vitamin C', unit: 'mg',  icon: 'lemon',      color: '#d47a00', bg: '#fff5e6', tracked: true  },
  { key: 'vitamin_a_mcg',   label: 'Vitamin A', unit: 'mcg', icon: 'visibility', color: '#8a5a00', bg: '#fff8e6', tracked: true  },
  { key: 'potassium_mg',    label: 'Potassium', unit: 'mg',  icon: 'water_drop', color: '#1a5a8a', bg: '#e6f2ff', tracked: true  },
  { key: 'phosphorus_mg',   label: 'Phosphorus',unit: 'mg',  icon: 'biotech',    color: '#1a7a6a', bg: '#e6faf7', tracked: true  },
  { key: 'omega3_g',        label: 'Omega-3',   unit: 'g',   icon: 'waves',      color: '#1a4a8a', bg: '#eaf0ff', tracked: true  },
]

const VITAL_INSIGHTS = {
  pcod: [
    { nutrient: 'iron_mg',       priority: 'critical', message: 'Iron is critical for PCOD — combine with Vitamin C to triple absorption. Target: 21 mg/day.' },
    { nutrient: 'magnesium_mg',  priority: 'high',     message: 'Magnesium improves insulin sensitivity — eat pumpkin seeds, leafy greens.' },
    { nutrient: 'omega3_g',      priority: 'high',     message: 'Omega-3 reduces PCOD inflammation and helps regulate hormones. Aim for 1.5 g/day.' },
    { nutrient: 'vitamin_d_mcg', priority: 'medium',   message: 'Low Vitamin D worsens PCOD symptoms. 15 mins morning sunlight daily helps.' },
  ],
  diabetes: [
    { nutrient: 'magnesium_mg',   priority: 'critical', message: 'Magnesium deficiency is directly linked to insulin resistance. Prioritise dark greens and nuts.' },
    { nutrient: 'potassium_mg',   priority: 'high',     message: 'Potassium helps manage blood glucose. Bananas, sweet potato, and dal are good sources.' },
    { nutrient: 'vitamin_b12_mcg',priority: 'medium',   message: 'Long-term Metformin use depletes B12. Monitor levels and supplement if needed.' },
  ],
  hypertension: [
    { nutrient: 'omega3_g',     priority: 'critical', message: 'Omega-3 (flaxseeds, walnuts) significantly reduces blood pressure. Include daily.' },
    { nutrient: 'calcium_mg',   priority: 'high',     message: 'Calcium deficiency is linked to higher blood pressure. Target 1000 mg/day.' },
    { nutrient: 'potassium_mg', priority: 'medium',   message: 'Potassium balances sodium and relaxes blood vessels. Eat more dal, banana, sweet potato.' },
  ],
  thyroid: [
    { nutrient: 'vitamin_d_mcg', priority: 'critical', message: 'Vitamin D deficiency is extremely common with hypothyroidism. Get sunlight + fortified milk.' },
    { nutrient: 'calcium_mg',    priority: 'high',     message: 'Thyroid medications can reduce calcium absorption. Ensure adequate dairy intake.' },
    { nutrient: 'magnesium_mg',  priority: 'medium',   message: 'Magnesium supports thyroid hormone production. Include leafy greens and seeds.' },
  ],
  anemia: [
    { nutrient: 'iron_mg',      priority: 'critical', message: 'Iron is the core treatment for anemia. Pair with Vitamin C for 2–3× better absorption.' },
    { nutrient: 'vitamin_c_mg', priority: 'high',     message: 'Vitamin C dramatically boosts iron absorption. Add lemon, amla, or tomato to every meal.' },
    { nutrient: 'folate_mcg',   priority: 'medium',   message: 'Folate deficiency causes megaloblastic anemia. Eat drumstick, methi, and dal regularly.' },
  ],
  general: [
    { nutrient: 'iron_mg',        priority: 'high',   message: 'Iron is commonly low in Indian diets. Pair iron-rich foods with Vitamin C to boost absorption 2–3×.' },
    { nutrient: 'vitamin_b12_mcg',priority: 'high',   message: 'B12 is hard to get from plant foods alone. Consider fortified dairy or eggs regularly.' },
    { nutrient: 'vitamin_d_mcg',  priority: 'medium', message: '70% of Indians are Vitamin D deficient. Morning sunlight + fortified milk helps.' },
  ],
}

// ─── Data computation helpers ─────────────────────────────────────────────────

/** Compute all nutrient totals from one day's meal plan slots */
function computeDayNutrition(dayPlan) {
  const n = {
    calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
    iron_mg: 0, calcium_mg: 0, vitamin_d_mcg: 0, vitamin_b12_mcg: 0,
    folate_mcg: 0, magnesium_mg: 0, zinc_mg: 0, vitamin_c_mg: 0,
    vitamin_a_mcg: 0, potassium_mg: 0, phosphorus_mg: 0, omega3_g: 0,
    sodium_mg: 0, itemCount: 0,
  }
  if (!dayPlan) return n
  Object.values(dayPlan).forEach((slot) => {
    ;(slot || []).forEach(({ food, portion_g }) => {
      const scale = (portion_g || 100) / 100
      const fn = food?.nutrition || {}
      n.calories        += (fn.calories        || 0) * scale
      n.protein_g       += (fn.protein_g       || 0) * scale
      n.carbs_g         += (fn.carbs_g         || 0) * scale
      n.fat_g           += (fn.fat_g           || 0) * scale
      n.fiber_g         += (fn.fiber_g         || 0) * scale
      n.iron_mg         += (fn.iron_mg         || 0) * scale
      n.calcium_mg      += (fn.calcium_mg      || 0) * scale
      n.vitamin_d_mcg   += (fn.vitamin_d_mcg   || 0) * scale
      n.vitamin_b12_mcg += (fn.vitamin_b12_mcg || 0) * scale
      n.folate_mcg      += (fn.folate_mcg      || 0) * scale
      n.magnesium_mg    += (fn.magnesium_mg    || 0) * scale
      n.zinc_mg         += (fn.zinc_mg         || 0) * scale
      n.vitamin_c_mg    += (fn.vitamin_c_mg    || 0) * scale
      n.vitamin_a_mcg   += (fn.vitamin_a_mcg   || 0) * scale
      n.potassium_mg    += (fn.potassium_mg    || 0) * scale
      n.phosphorus_mg   += (fn.phosphorus_mg   || 0) * scale
      n.omega3_g        += (fn.omega3_g        || 0) * scale
      n.sodium_mg       += (fn.sodium_mg       || 0) * scale
      n.itemCount++
    })
  })
  Object.keys(n).forEach((k) => {
    if (k !== 'itemCount') n[k] = Math.round(n[k] * 10) / 10
  })
  return n
}

/** How many consecutive days (including today) have at least one food logged */
function calcLoggingStreak(weekPlan) {
  const todayJs = new Date().getDay() // 0=Sun
  let streak = 0
  for (let i = 0; i < 7; i++) {
    const jsDay  = ((todayJs - i) + 7) % 7
    const dayIdx = (jsDay + 6) % 7        // Mon=0 … Sun=6
    const plan   = weekPlan[DAYS[dayIdx]]
    const hasFood = plan && Object.values(plan).some((s) => (s || []).length > 0)
    if (hasFood) streak++
    else break
  }
  return streak
}

/** Compute an overall health score (0–100) based on today's intake vs RDA */
function calcHealthScore(intake, rda) {
  if (intake.itemCount === 0) return 0
  const checks = [
    { val: intake.calories,     target: rda.calories     || 2000, w: 0.20 },
    { val: intake.protein_g,    target: rda.protein_g    || 55,   w: 0.20 },
    { val: intake.fiber_g,      target: 25,                        w: 0.15 },
    { val: intake.iron_mg,      target: rda.iron_mg      || 17,   w: 0.12 },
    { val: intake.calcium_mg,   target: rda.calcium_mg   || 1000, w: 0.10 },
    { val: intake.vitamin_c_mg, target: rda.vitamin_c_mg || 40,   w: 0.10 },
    { val: intake.magnesium_mg, target: rda.magnesium_mg || 310,  w: 0.08 },
    { val: intake.zinc_mg,      target: rda.zinc_mg      || 8,    w: 0.05 },
  ]
  return Math.min(100, Math.round(
    checks.reduce((sum, { val, target, w }) => sum + Math.min(100, (val / target) * 100) * w, 0)
  ))
}

/** Time-based English greeting */
function getGreeting(name) {
  const h = new Date().getHours()
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${salutation}, ${name || 'there'}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NutrientRing({ label, current, target, unit = 'g', colorClass, strokeColor }) {
  const pct    = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const offset = CIRCUMFERENCE * (1 - pct / 100)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="progress-ring w-full h-full" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="#e6e9e7" strokeWidth="10" />
          <circle cx="64" cy="64" r="56" fill="none" stroke={strokeColor} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
            className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-headline text-xl font-black ${colorClass}`}>{pct}%</span>
          <span className="text-[10px] text-[#6b7c68] font-body font-medium mt-0.5 text-center leading-tight px-2">{label}</span>
        </div>
      </div>
      <p className="text-xs text-[#42493e] font-body">
        <span className="font-semibold text-[#1a2e19]">{unit === 'kcal' ? Math.round(current) : current}{unit === 'kcal' ? '' : unit}</span>
        <span className="text-[#8a9187]"> / {unit === 'kcal' ? Math.round(target) : target}{unit === 'kcal' ? ' kcal' : unit}</span>
      </p>
    </div>
  )
}

function NutrientMiniCard({ config, intake, target, isHighlighted }) {
  const pct    = target > 0 ? Math.min(100, Math.round((intake / target) * 100)) : 0
  const status = pct >= 70 ? 'good' : pct >= 30 ? 'moderate' : 'low'
  const sc     = { good: { label: 'On Track', bar: 'bg-[#154212]', text: 'text-[#154212]' },
                   moderate: { label: 'Moderate', bar: 'bg-amber-500', text: 'text-amber-600' },
                   low:  { label: 'Low',      bar: 'bg-red-500',    text: 'text-red-600'  } }[status]
  return (
    <div className={`rounded-2xl p-4 border transition-all ${isHighlighted ? 'border-[#154212] shadow-md' : 'border-[#e6e9e7] hover:border-[#154212]/30 hover:shadow-sm'}`}
      style={{ background: isHighlighted ? config.bg : 'white' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.bg }}>
            <span className="material-symbols-outlined leading-none" style={{ color: config.color, fontSize: '18px' }}>{config.icon}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#1a2e19]">{config.label}</p>
            <p className="text-[10px] text-[#8a9187]">{intake} / {target} {config.unit}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold ${sc.text}`}>{sc.label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#e6e9e7]">
        <div className={`h-full rounded-full transition-all duration-700 ${sc.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-right text-[10px] text-[#6b7c68] mt-1">{pct}% RDA</p>
    </div>
  )
}

/** Card showing one logged food item from today's plan */
function TodayFoodCard({ food, portion_g, slot }) {
  const navigate = useNavigate()
  const kcal = Math.round((food?.nutrition?.calories || 0) * (portion_g / 100))
  return (
    <div
      className="min-w-[200px] max-w-[200px] bg-white rounded-2xl overflow-hidden border border-[#e6e9e7] shadow-sm cursor-pointer group transition-all hover:shadow-md hover:-translate-y-0.5 flex-shrink-0"
      onClick={() => navigate(`/recipes/${food.id}`)}
    >
      <div className="h-28 flex items-center justify-center text-5xl" style={{ background: '#f2f4f2' }}>
        {food?.food_emoji || '🍽️'}
      </div>
      <div className="p-3 space-y-1">
        <p className="font-semibold text-[#1a2e19] text-xs leading-tight line-clamp-2">{food?.name}</p>
        <div className="flex items-center justify-between text-[10px] text-[#6b7c68]">
          <span className="px-2 py-0.5 rounded-full bg-[#154212]/10 text-[#154212] font-semibold capitalize">
            {slot?.label || 'Meal'}
          </span>
          <span className="font-semibold">{kcal} kcal</span>
        </div>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#e6e9e7] rounded-xl px-4 py-2.5 shadow-lg text-sm">
      <p className="font-semibold text-[#1a2e19]">{label}</p>
      <p className="text-[#154212] font-bold mt-0.5">{payload[0].value.toLocaleString()} kcal</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile }                  = useProfileStore()
  const { toggleSave, savedRecipes } = useRecipeStore()
  const { weekPlan }                 = useMealPlanStore()

  const activeProfile = profile || mockUserProfile

  // Today's key in the meal plan (Mon / Tue / … / Sun)
  const todayKey = useMemo(() => {
    const jsDay = new Date().getDay() // 0=Sun
    return DAYS[(jsDay + 6) % 7]      // Mon=0 … Sun=6
  }, [])

  // ── RDA targets from profile ──────────────────────────────────────────────
  const rda = useMemo(() => getRDA({
    age:             activeProfile.age,
    gender:          activeProfile.gender,
    weightKg:        activeProfile.weight_kg ?? activeProfile.weightKg,
    healthConditions:activeProfile.health_conditions ?? activeProfile.healthConditions ?? [],
    tdee:            activeProfile.tdee || activeProfile.daily_calorie_target,
  }), [activeProfile])

  // ── Today's actual nutrition from meal plan ───────────────────────────────
  const todayIntake = useMemo(
    () => computeDayNutrition(weekPlan[todayKey]),
    [weekPlan, todayKey]
  )

  // ── 7-day calorie chart — from actual plan ────────────────────────────────
  const weekCalories = useMemo(() =>
    DAYS.map((day) => ({
      day,
      kcal: Math.round(computeDayNutrition(weekPlan[day]).calories),
    })),
  [weekPlan])

  // ── Today's logged food items for the menu section ────────────────────────
  const todayFoodItems = useMemo(() => {
    const plan  = weekPlan[todayKey] || {}
    const items = []
    MEAL_SLOTS_POOL.forEach((slot) => {
      ;(plan[slot.id] || []).forEach(({ food, portion_g, uid }) => {
        items.push({ food, portion_g, uid, slot })
      })
    })
    return items
  }, [weekPlan, todayKey])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const loggingStreak = useMemo(() => calcLoggingStreak(weekPlan), [weekPlan])
  const healthScore   = useMemo(() => calcHealthScore(todayIntake, rda), [todayIntake, rda])
  const weekAvg       = useMemo(() => {
    const days = weekCalories.filter((d) => d.kcal > 0)
    return days.length ? Math.round(days.reduce((s, d) => s + d.kcal, 0) / days.length) : 0
  }, [weekCalories])

  // ── BMI / profile info ────────────────────────────────────────────────────
  const bmi      = activeProfile.bmi ?? 22.4
  const bmiInfo  = getBMICategory(bmi)
  const season   = getCurrentSeason()
  const weightKg = activeProfile.weight_kg ?? activeProfile.weightKg ?? 60
  const healthConditions = (activeProfile.health_conditions ?? activeProfile.healthConditions ?? [])
    .map((c) => c.toLowerCase())

  // ── Hydration ─────────────────────────────────────────────────────────────
  const baseHydration = Math.max(2000, Math.min(4000, Math.round(weightKg * 35 / 250) * 250))
  const hydrationAdjustments = useMemo(() => {
    const adj = []
    if (healthConditions.some((c) => ['pcod', 'pcos', 'diabetes'].includes(c)))
      adj.push({ label: 'PCOD/Diabetes', ml: +250 })
    if (healthConditions.some((c) => c === 'hypertension'))
      adj.push({ label: 'Hypertension',  ml: +250 })
    if (healthConditions.some((c) => c.includes('kidney')))
      adj.push({ label: 'Kidney',        ml: -500 })
    return adj
  }, [healthConditions])
  const conditionBonus = hydrationAdjustments.reduce((s, a) => s + a.ml, 0)
  const [hydrationTarget, setHydrationTarget] = useState(baseHydration + conditionBonus)
  const [waterMl,         setWaterMl]         = useState(0)
  const totalGlasses  = Math.round(hydrationTarget / 250)
  const filledGlasses = Math.min(totalGlasses, Math.round(waterMl / 250))
  const waterPct      = Math.min(100, Math.round((waterMl / hydrationTarget) * 100))

  // ── Vital insight — based on actual LOWEST-coverage nutrient ─────────────
  const primaryCondition = healthConditions.find((c) => VITAL_INSIGHTS[c]) ?? 'general'
  const vitalInsights    = VITAL_INSIGHTS[primaryCondition] ?? VITAL_INSIGHTS.general

  // Find the nutrient with lowest actual coverage (for the banner)
  const topInsight = useMemo(() => {
    if (todayIntake.itemCount > 0) {
      // Find the most deficient nutrient from the insights list
      return vitalInsights.reduce((worst, insight) => {
        const intake = todayIntake[insight.nutrient] ?? 0
        const target = rda[insight.nutrient] ?? 1
        const pct    = intake / target
        const wPct   = (todayIntake[worst?.nutrient] ?? 0) / (rda[worst?.nutrient] ?? 1)
        return pct < wPct ? insight : worst
      }, vitalInsights[0])
    }
    return vitalInsights[0]
  }, [vitalInsights, todayIntake, rda])

  const topConfig = MICRONUTRIENT_CONFIG.find((c) => c.key === topInsight?.nutrient)
  const topIntake = todayIntake[topInsight?.nutrient] ?? 0
  const topTarget = rda[topInsight?.nutrient] ?? 1

  const hasAnyMeals = todayIntake.itemCount > 0

  return (
    <div className="px-8 pt-8 pb-12 space-y-8 font-body max-w-screen-xl mx-auto">

      {/* ── Greeting ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-2xl font-black text-[#154212]">
            {getGreeting(activeProfile.name?.split(' ')[0])} 🌿
          </h1>
          <p className="text-sm text-[#6b7c68] mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            <span className="capitalize">{season}</span> season
          </p>
        </div>
        <button
          onClick={() => navigate('/meal-planner')}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#154212] text-white text-sm font-semibold hover:bg-[#2d5a27] transition-all"
        >
          <span className="material-symbols-outlined text-base">calendar_month</span>
          Weekly Plan
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Your Daily Nutrition
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-12 gap-6">

        {/* Macro Rings Panel */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-7 border border-[#e6e9e7] shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-headline text-3xl font-black text-[#154212]">Your Daily Nutrition</h2>
              <p className="text-xs text-[#6b7c68] mt-1">
                {hasAnyMeals
                  ? `${todayIntake.itemCount} item${todayIntake.itemCount > 1 ? 's' : ''} logged today — compared with your ICMR-RDA targets`
                  : 'No meals logged today — add foods to your plan to track nutrition'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#154212] text-white text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                {Math.round(todayIntake.calories).toLocaleString()} / {Math.round(rda.calories || 2000).toLocaleString()} kcal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#bcf0ae] text-[#154212] text-xs font-semibold capitalize">
                <span className="material-symbols-outlined text-sm">directions_run</span>
                {(activeProfile.activity_level ?? activeProfile.activityLevel ?? 'moderate').replace('_', ' ')}
              </span>
            </div>
          </div>

          {hasAnyMeals ? (
            <>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                <NutrientRing label="Calories" unit="kcal" current={todayIntake.calories}  target={rda.calories  || 2000} colorClass="text-[#154212]" strokeColor="#154212" />
                <NutrientRing label="Protein"  unit="g"   current={todayIntake.protein_g} target={rda.protein_g || 55}   colorClass="text-[#7c5800]"  strokeColor="#feb700" />
                <NutrientRing label="Carbs"    unit="g"   current={todayIntake.carbs_g}   target={rda.carbs_g   || 260}  colorClass="text-[#2d5a27]"  strokeColor="#2d5a27" />
                <NutrientRing label="Fats"     unit="g"   current={todayIntake.fat_g}     target={rda.fat_g     || 55}   colorClass="text-[#692000]"  strokeColor="#692000" />
              </div>
              <div className="mt-6 pt-5 border-t border-[#f2f4f2] grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Calories', val: todayIntake.calories,  tgt: rda.calories  || 2000, color: 'bg-[#154212]' },
                  { label: 'Protein',  val: todayIntake.protein_g, tgt: rda.protein_g || 55,   color: 'bg-[#feb700]' },
                  { label: 'Carbs',    val: todayIntake.carbs_g,   tgt: rda.carbs_g   || 260,  color: 'bg-[#2d5a27]' },
                  { label: 'Fats',     val: todayIntake.fat_g,     tgt: rda.fat_g     || 55,   color: 'bg-[#692000]' },
                ].map(({ label, val, tgt, color }) => {
                  const pct = Math.min(100, Math.round((val / tgt) * 100))
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#6b7c68]">
                        <span>{label}</span>
                        <span className="font-semibold text-[#1a2e19]">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#e6e9e7]">
                        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center py-8 gap-3 text-center">
              <span className="material-symbols-outlined text-4xl text-[#e6e9e7]">restaurant_menu</span>
              <p className="text-sm text-[#6b7c68]">Add meals to your <strong className="text-[#154212]">{todayKey === DAYS[(new Date().getDay() + 6) % 7] ? 'today\'s' : todayKey}</strong> plan to see your nutrition breakdown.</p>
              <button onClick={() => navigate('/meal-planner')}
                className="px-4 py-2 bg-[#154212] text-white rounded-xl text-xs font-semibold hover:bg-[#2d5a27] transition-all">
                Open Meal Planner
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

          {/* BMI Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6e9e7] shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-base font-bold text-[#1a2e19]">BMI Status</h3>
              <span className="material-symbols-outlined text-[#154212]">monitor_weight</span>
            </div>
            <div className="relative mt-3 mb-5">
              <div className="h-4 rounded-full bg-gradient-to-r from-blue-400 via-[#154212] via-50% to-red-500 relative overflow-visible">
                <div className="absolute -top-1 w-5 h-5 rounded-full bg-white border-2 border-[#154212] shadow-md transition-all duration-700 -translate-x-1/2"
                  style={{ left: `${bmiInfo.position}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-[#8a9187] mt-2 px-0.5">
                <span>15</span><span>18.5</span><span>23</span><span>25</span><span>30</span><span>40</span>
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className={`font-headline text-4xl font-black ${bmiInfo.color}`}>{bmi}</span>
              <span className="text-sm text-[#6b7c68] mb-1">kg/m²</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bmiInfo.bg} ${bmiInfo.color}`}>
              {bmiInfo.label}
            </span>
            <p className="mt-3 text-xs text-[#6b7c68] leading-relaxed italic">
              {AYURVEDIC_MSG[bmiInfo.label] ?? AYURVEDIC_MSG['Normal / Healthy']}
            </p>
          </div>

          {/* Hydration Card */}
          <div className="rounded-3xl p-6 shadow-sm" style={{ background: '#1a3a18', color: 'white' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline text-base font-bold text-white">Hydration</h3>
              <span className="material-symbols-outlined text-[#bcf0ae] text-xl">water_drop</span>
            </div>
            <p className="text-[10px] text-white/50 mb-3">
              Base: {weightKg} kg × 35 ml = {baseHydration} ml
              {hydrationAdjustments.map((a, i) => (
                <span key={i}> · {a.label} {a.ml > 0 ? `+${a.ml}` : a.ml} ml</span>
              ))}
            </p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-headline text-3xl font-black text-white">{waterMl}</span>
              <span className="text-white/60 text-sm">/ {hydrationTarget} ml</span>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${waterPct >= 80 ? 'bg-[#bcf0ae] text-[#154212]' : waterPct >= 50 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                {waterPct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/15 mb-4">
              <div className="h-full rounded-full bg-[#bcf0ae] transition-all duration-700" style={{ width: `${waterPct}%` }} />
            </div>
            <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${Math.min(totalGlasses, 8)}, 1fr)` }}>
              {Array.from({ length: totalGlasses }).map((_, i) => (
                <button key={i} onClick={() => setWaterMl((i + 1) * 250)} title={`${(i + 1) * 250} ml`}
                  className={`h-5 rounded transition-all ${i < filledGlasses ? 'bg-white/40 hover:bg-white/60' : 'bg-white/10 hover:bg-white/20'}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setWaterMl(Math.min(hydrationTarget, waterMl + 250))}
                className="flex-1 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span>+250 ml
              </button>
              <button onClick={() => setHydrationTarget(Math.max(1500, hydrationTarget - 250))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-all">
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <button onClick={() => setHydrationTarget(Math.min(5000, hydrationTarget + 250))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <p className="text-[10px] text-white/40 text-center mt-2">Tap glasses or ±250 ml to track intake</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Vital Insight Banner
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl px-6 py-5 border border-[#ffdbcf] flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: '#ffdbcf' }}>
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#692000]/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[#692000]">{topConfig?.icon || 'warning'}</span>
          </div>
          <div>
            <p className="font-semibold text-[#692000] text-sm">
              {hasAnyMeals
                ? `Vital Insight: Low ${topConfig?.label ?? 'Nutrient'} (${Math.round((topIntake / topTarget) * 100)}% of RDA)`
                : `Vital Insight: ${topConfig?.label ?? 'Nutrient'} — Start logging meals to track`}
            </p>
            <p className="text-xs text-[#692000]/70 mt-0.5 leading-relaxed max-w-lg">{topInsight?.message}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button onClick={() => navigate('/recipes')}
                className="px-4 py-2 bg-[#692000] text-white rounded-xl text-xs font-semibold hover:bg-[#8a3010] transition-all">
                See {topConfig?.label}-rich recipes
              </button>
              <button onClick={() => navigate('/food-combinations')}
                className="px-4 py-2 bg-[#692000]/10 text-[#692000] border border-[#692000]/30 rounded-xl text-xs font-semibold hover:bg-[#692000]/20 transition-all">
                Food Synergy Guide
              </button>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/chatbot')}
          className="shrink-0 px-5 py-2.5 bg-white text-[#692000] rounded-xl text-sm font-semibold border border-[#692000]/20 hover:bg-[#fff5f2] transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-center">
          <span className="material-symbols-outlined text-base">healing</span>
          Ask AarogyaAI
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Vital Nutrients Tracker (from actual meal plan)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-3xl p-7 border border-[#e6e9e7] shadow-sm">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-headline text-2xl font-bold text-[#1a2e19]">Vital Nutrients Tracker</h2>
            <p className="text-xs text-[#6b7c68] mt-1">
              {hasAnyMeals
                ? 'Micronutrients from your logged meals — compared against ICMR-NIN 2020 RDA'
                : 'Log meals in your planner to see real micronutrient tracking'}
            </p>
          </div>
          {hasAnyMeals && (
            <div className="flex gap-2 flex-wrap">
              {vitalInsights.slice(0, 2).map((insight, i) => {
                const cfg = MICRONUTRIENT_CONFIG.find((c) => c.key === insight.nutrient)
                const pct = rda[insight.nutrient] > 0 ? Math.round((todayIntake[insight.nutrient] ?? 0) / rda[insight.nutrient] * 100) : 0
                return cfg ? (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                    style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '33' }}>
                    {cfg.label}: {pct}% RDA
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        <div className="mb-5 p-3 rounded-xl bg-[#f8faf8] border border-[#e6e9e7] flex items-start gap-3">
          <span className="material-symbols-outlined text-[#154212] mt-0.5">tips_and_updates</span>
          <div>
            <p className="text-xs font-semibold text-[#1a2e19]">
              Focus for {primaryCondition === 'general' ? 'Optimal Health' : primaryCondition.toUpperCase()}
            </p>
            <p className="text-xs text-[#6b7c68] mt-0.5">
              {vitalInsights.map((v) => MICRONUTRIENT_CONFIG.find((c) => c.key === v.nutrient)?.label).filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {MICRONUTRIENT_CONFIG.filter((c) => c.tracked).map((cfg) => {
            const intake     = todayIntake[cfg.key] ?? 0
            const target     = rda[cfg.key] ?? 1
            const highlighted = vitalInsights.some((v) => v.nutrient === cfg.key)
            return <NutrientMiniCard key={cfg.key} config={cfg} intake={intake} target={target} isHighlighted={highlighted} />
          })}
        </div>

        {!hasAnyMeals && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-[#f8faf8] border border-[#e6e9e7]">
            <span className="material-symbols-outlined text-[#6b7c68]">info</span>
            <p className="text-xs text-[#6b7c68]">
              All values showing 0% because no meals are logged for today.{' '}
              <button onClick={() => navigate('/meal-planner')} className="text-[#154212] font-semibold hover:underline">
                Add meals to your planner
              </button>{' '}
              to see real tracking.
            </p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-[#f2f4f2] space-y-3">
          <p className="text-xs font-semibold text-[#6b7c68] uppercase tracking-wider">
            Personalised Recommendations for Your Profile
          </p>
          {vitalInsights.map((insight, i) => {
            const cfg    = MICRONUTRIENT_CONFIG.find((c) => c.key === insight.nutrient)
            const intake = todayIntake[insight.nutrient] ?? 0
            const target = rda[insight.nutrient] ?? 1
            const pct    = Math.min(100, Math.round((intake / target) * 100))
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f8faf8] transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: cfg?.bg || '#f0f0f0' }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: cfg?.color || '#333' }}>{cfg?.icon || 'info'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-[#1a2e19]">{cfg?.label ?? insight.nutrient}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      insight.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'high'     ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {insight.priority}
                    </span>
                    {hasAnyMeals && <span className="text-[10px] text-[#6b7c68] ml-auto">{pct}% of RDA today</span>}
                  </div>
                  <p className="text-xs text-[#42493e] leading-relaxed">{insight.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — Today's Logged Meals
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-black text-[#1a2e19]">Today's Meals</h2>
            <p className="text-xs text-[#6b7c68] mt-0.5">
              {hasAnyMeals
                ? `${todayIntake.itemCount} item${todayIntake.itemCount > 1 ? 's' : ''} logged · ${Math.round(todayIntake.calories)} kcal`
                : 'No meals logged for today'}
            </p>
          </div>
          <button onClick={() => navigate('/meal-planner')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#154212] text-[#154212] text-sm font-semibold hover:bg-[#154212] hover:text-white transition-all">
            <span className="material-symbols-outlined text-base">calendar_month</span>
            Edit Plan
          </button>
        </div>

        {hasAnyMeals ? (
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {todayFoodItems.map(({ food, portion_g, uid, slot }) => (
              <TodayFoodCard key={uid} food={food} portion_g={portion_g} slot={slot} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-[#e6e9e7] gap-3 text-center">
            <span className="text-5xl">🥗</span>
            <p className="text-sm font-semibold text-[#1a2e19]">No meals planned for today yet</p>
            <p className="text-xs text-[#6b7c68] max-w-xs">
              Open the Meal Planner to add your breakfast, lunch, dinner and snacks. Your nutrition stats will update instantly.
            </p>
            <button onClick={() => navigate('/meal-planner')}
              className="mt-1 px-5 py-2.5 bg-[#154212] text-white rounded-xl text-sm font-semibold hover:bg-[#2d5a27] transition-all">
              Plan Today's Meals
            </button>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — Weekly Trend (real data from plan)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-[#e6e9e7] shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-headline text-xl font-bold text-[#1a2e19]">7-Day Calorie Trend</h2>
              <p className="text-xs text-[#6b7c68] mt-0.5">
                Energy from your logged meals vs daily target ({Math.round(rda.calories || 2000).toLocaleString()} kcal)
              </p>
            </div>
            <span className="material-symbols-outlined text-[#154212]">insights</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekCalories} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c68' }} />
              <YAxis domain={[0, Math.max(rda.calories * 1.3 || 2600, ...weekCalories.map((d) => d.kcal))]}
                axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9187' }} tickCount={4} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#e6e9e7', radius: 8 }} />
              <Bar dataKey="kcal" radius={[8, 8, 4, 4]}>
                {weekCalories.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.day === todayKey ? '#154212' : entry.kcal === 0 ? '#e6e9e7' : entry.kcal > (rda.calories || 2000) ? '#ffdbcf' : '#bcf0ae'}
                    stroke={entry.day === todayKey ? '#154212' : 'none'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4 text-xs text-[#6b7c68] flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#154212] inline-block" />Today</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#bcf0ae] inline-block" />Within target</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#ffdbcf] inline-block" />Over target</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#e6e9e7] inline-block" />Not logged</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Week Average */}
          <div className="bg-white rounded-2xl p-5 border border-[#e6e9e7] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#bcf0ae] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#154212] text-lg">show_chart</span>
              </div>
              <p className="text-sm font-semibold text-[#1a2e19]">Week Average</p>
            </div>
            {weekAvg > 0 ? (
              <>
                <p className="font-headline text-3xl font-black text-[#154212]">{weekAvg.toLocaleString()}</p>
                <p className="text-xs text-[#6b7c68] mt-0.5">kcal / day (days with meals)</p>
              </>
            ) : (
              <>
                <p className="font-headline text-3xl font-black text-[#e6e9e7]">—</p>
                <p className="text-xs text-[#6b7c68] mt-0.5">Log meals to see your average</p>
              </>
            )}
          </div>

          {/* Logging Streak */}
          <div className="bg-white rounded-2xl p-5 border border-[#e6e9e7] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#feb700]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#7c5800] text-lg">local_fire_department</span>
              </div>
              <p className="text-sm font-semibold text-[#1a2e19]">Logging Streak</p>
            </div>
            <p className="font-headline text-3xl font-black text-[#7c5800]">{loggingStreak}</p>
            <p className="text-xs text-[#6b7c68] mt-0.5">
              {loggingStreak === 0 ? 'Log meals today to start your streak'
               : loggingStreak === 1 ? '1 consecutive day with meals logged'
               : `${loggingStreak} consecutive days with meals logged`}
            </p>
          </div>

          {/* Today's Health Score */}
          <div className="bg-white rounded-2xl p-5 border border-[#e6e9e7] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2d5a27] text-lg">favorite</span>
              </div>
              <p className="text-sm font-semibold text-[#1a2e19]">Today's Health Score</p>
            </div>
            {hasAnyMeals ? (
              <>
                <div className="flex items-end gap-2">
                  <p className={`font-headline text-3xl font-black ${healthScore >= 70 ? 'text-[#2d5a27]' : healthScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {healthScore}
                  </p>
                  <p className="text-sm text-[#6b7c68] mb-0.5">/ 100</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#e6e9e7]">
                  <div className={`h-full rounded-full transition-all duration-700 ${healthScore >= 70 ? 'bg-[#2d5a27]' : healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${healthScore}%` }} />
                </div>
                <p className="text-[10px] text-[#6b7c68] mt-1">
                  Based on macro + micronutrient coverage vs your RDA targets
                </p>
              </>
            ) : (
              <>
                <p className="font-headline text-3xl font-black text-[#e6e9e7]">—</p>
                <p className="text-xs text-[#6b7c68] mt-0.5">Log meals to calculate your score</p>
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
