import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useProfileStore } from '../store/profileStore'
import { useRecipeStore } from '../store/recipeStore'
import { mockUserProfile, mockRecommendations } from '../data/mockRecipes'
import { getRDA, getRDAPercent } from '../utils/rda'
import { getGILabel } from '../utils/healthScore'
import { getCurrentSeason } from '../utils/seasonDetector'
import { getBMICategory } from '../utils/bmi'

// ─── Constants ────────────────────────────────────────────────────────────────
const CIRCUMFERENCE = 351.85  // 2 * π * 56

const WEEK_DATA = [
  { day: 'Mon', kcal: 1920 },
  { day: 'Tue', kcal: 2100 },
  { day: 'Wed', kcal: 1750 },
  { day: 'Thu', kcal: 2200 },
  { day: 'Fri', kcal: 1840 },
  { day: 'Sat', kcal: 2350 },
  { day: 'Sun', kcal: 1680 },
]

// Today's mock macro intake
const TODAY_INTAKE = {
  calories: 1840,
  protein_g: 45,
  carbs_g: 210,
  fat_g: 52,
}

// Today's mock micronutrient intake
const TODAY_MICRO_INTAKE = {
  iron_mg: 8.5,
  calcium_mg: 420,
  vitamin_d_mcg: 4.2,
  vitamin_b12_mcg: 0.8,
  folate_mcg: 180,
  magnesium_mg: 195,
  zinc_mg: 6.2,
  vitamin_c_mg: 45,
  vitamin_a_mcg: 280,
  selenium_mcg: 22,
  iodine_mcg: 95,
  omega3_g: 0.8,
  dha_mg: 120,
}

const AYURVEDIC_MSG = {
  'Normal / Healthy': 'Your Prakriti is balanced — pitta in harmony. Maintain with seasonal foods.',
  'Underweight':      'Nourish with warm, grounding foods rich in healthy fats to build Ojas.',
  'Overweight':       'Favour light, warm meals. Kapha-balancing spices like ginger aid metabolism.',
  'Obese I':          'Prioritise Kapha-reducing diet: bitter greens, legumes, and warm water.',
  'Obese II':         'Consult an Ayurvedic practitioner for a personalised Kapha-pacifying plan.',
}

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }

// ─── Micronutrient Display Config ─────────────────────────────────────────────
const MICRONUTRIENT_CONFIG = [
  { key: 'iron_mg',          label: 'Iron',       unit: 'mg',  icon: 'opacity',     color: '#d63c1a', bg: '#fff0ec', conditions: ['pcod', 'anemia', 'pregnancy'] },
  { key: 'calcium_mg',       label: 'Calcium',    unit: 'mg',  icon: 'nutrition',   color: '#1a63a8', bg: '#e8f2ff', conditions: ['thyroid'] },
  { key: 'vitamin_d_mcg',    label: 'Vitamin D',  unit: 'mcg', icon: 'wb_sunny',    color: '#d49400', bg: '#fff9e6', conditions: ['pcod', 'thyroid'] },
  { key: 'vitamin_b12_mcg',  label: 'B12',        unit: 'mcg', icon: 'science',     color: '#7a2a8a', bg: '#f7eeff', conditions: ['vegetarian', 'vegan'] },
  { key: 'folate_mcg',       label: 'Folate',     unit: 'mcg', icon: 'eco',         color: '#2a7a3a', bg: '#eefff0', conditions: ['pcod', 'pregnancy'] },
  { key: 'magnesium_mg',     label: 'Magnesium',  unit: 'mg',  icon: 'bolt',        color: '#3a6aa8', bg: '#eef4ff', conditions: ['diabetes', 'pcod'] },
  { key: 'zinc_mg',          label: 'Zinc',       unit: 'mg',  icon: 'security',    color: '#5a7a1a', bg: '#f2f9e6', conditions: ['pcod'] },
  { key: 'vitamin_c_mg',     label: 'Vitamin C',  unit: 'mg',  icon: 'lemon',       color: '#d47a00', bg: '#fff5e6', conditions: [] },
  { key: 'vitamin_a_mcg',    label: 'Vitamin A',  unit: 'mcg', icon: 'visibility',  color: '#8a5a00', bg: '#fff8e6', conditions: [] },
  { key: 'selenium_mcg',     label: 'Selenium',   unit: 'mcg', icon: 'biotech',     color: '#1a7a6a', bg: '#e6faf7', conditions: ['thyroid'] },
  { key: 'iodine_mcg',       label: 'Iodine',     unit: 'mcg', icon: 'water_drop',  color: '#1a5a8a', bg: '#e6f2ff', conditions: ['thyroid'] },
  { key: 'omega3_g',         label: 'Omega-3',    unit: 'g',   icon: 'waves',       color: '#1a4a8a', bg: '#eaf0ff', conditions: ['pcod', 'hypertension'] },
  { key: 'dha_mg',           label: 'DHA',        unit: 'mg',  icon: 'psychology',  color: '#6a1a8a', bg: '#f5eeff', conditions: ['pcod'] },
]

// Condition-specific vital insight messages
const VITAL_INSIGHTS = {
  pcod: [
    { nutrient: 'iron_mg',        priority: 'critical', message: 'Iron is critical for PCOD — combine with Vitamin C to triple absorption. Target: 21 mg/day.' },
    { nutrient: 'magnesium_mg',   priority: 'high',     message: 'Magnesium improves insulin sensitivity — eat pumpkin seeds, leafy greens.' },
    { nutrient: 'dha_mg',         priority: 'high',     message: 'DHA/Omega-3 reduces PCOD inflammation and regulates hormones. Aim for 250 mg/day.' },
    { nutrient: 'vitamin_d_mcg',  priority: 'medium',   message: 'Low Vitamin D worsens PCOD symptoms. Get 15 mins morning sunlight daily.' },
  ],
  diabetes: [
    { nutrient: 'magnesium_mg',   priority: 'critical', message: 'Magnesium deficiency is linked to insulin resistance. Eat dark leafy greens + nuts.' },
    { nutrient: 'selenium_mcg',   priority: 'high',     message: 'Selenium supports antioxidant defence against diabetic oxidative stress.' },
    { nutrient: 'vitamin_b12_mcg', priority: 'medium',  message: 'Long-term Metformin use depletes B12. Monitor and supplement if needed.' },
  ],
  hypertension: [
    { nutrient: 'omega3_g',       priority: 'critical', message: 'Omega-3 (ALA/DHA) significantly reduces blood pressure — eat flaxseeds, walnuts daily.' },
    { nutrient: 'calcium_mg',     priority: 'high',     message: 'Calcium deficiency is linked to higher blood pressure. Ensure 1000 mg/day.' },
    { nutrient: 'magnesium_mg',   priority: 'medium',   message: 'Magnesium relaxes blood vessels. Low intake worsens hypertension.' },
  ],
  thyroid: [
    { nutrient: 'iodine_mcg',     priority: 'critical', message: 'Iodine is essential for thyroid hormone synthesis. Aim for 150 mcg/day.' },
    { nutrient: 'selenium_mcg',   priority: 'high',     message: 'Selenium activates thyroid hormones (T4→T3 conversion). Eat 2 Brazil nuts daily.' },
    { nutrient: 'vitamin_d_mcg',  priority: 'medium',   message: 'Vitamin D deficiency is common with hypothyroidism. Supplement with medical advice.' },
  ],
  general: [
    { nutrient: 'iron_mg',        priority: 'high',     message: 'Iron intake appears low. Pair iron-rich foods with Vitamin C to boost absorption 2–3×.' },
    { nutrient: 'vitamin_b12_mcg', priority: 'high',    message: 'B12 is hard to get from plant foods. Consider fortified dairy or supplements.' },
    { nutrient: 'vitamin_d_mcg',  priority: 'medium',   message: '70% of Indians are Vitamin D deficient. Morning sunlight + fortified milk helps.' },
  ],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** SVG circular progress ring */
function NutrientRing({ label, current, target, unit = 'g', colorClass, strokeColor }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  const offset = CIRCUMFERENCE * (1 - pct / 100)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="progress-ring w-full h-full" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="#e6e9e7" strokeWidth="10" />
          <circle
            cx="64" cy="64" r="56"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-headline text-xl font-black ${colorClass}`}>{pct}%</span>
          <span className="text-[10px] text-[#6b7c68] font-body font-medium mt-0.5 text-center leading-tight px-2">{label}</span>
        </div>
      </div>
      <p className="text-xs text-[#42493e] font-body">
        <span className="font-semibold text-[#1a2e19]">{current}{unit}</span>
        <span className="text-[#8a9187]"> / {target}{unit}</span>
      </p>
    </div>
  )
}

/** Micronutrient mini status card */
function NutrientMiniCard({ config, intake, target, isHighlighted }) {
  const pct = target > 0 ? Math.min(100, Math.round((intake / target) * 100)) : 0
  const status = pct >= 70 ? 'good' : pct >= 30 ? 'moderate' : 'low'
  const statusConfig = {
    good:     { label: 'On Track',  bar: 'bg-[#154212]', text: 'text-[#154212]' },
    moderate: { label: 'Moderate',  bar: 'bg-amber-500', text: 'text-amber-600' },
    low:      { label: 'Low',       bar: 'bg-red-500',   text: 'text-red-600' },
  }
  const sc = statusConfig[status]

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isHighlighted
          ? 'border-[#154212] shadow-md'
          : 'border-[#e6e9e7] hover:border-[#154212]/30 hover:shadow-sm'
      }`}
      style={{ background: isHighlighted ? config.bg : 'white' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: config.bg }}>
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
        <div
          className={`h-full rounded-full transition-all duration-700 ${sc.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-[10px] text-[#6b7c68] mt-1">{pct}% RDA</p>
    </div>
  )
}

/** Meal recommendation card */
function MealCard({ recipe, mealType, isSaved, onToggleSave }) {
  const navigate = useNavigate()
  if (!recipe) return null
  const gi = getGILabel(recipe.nutrition?.glycemic_index)
  return (
    <div
      className="min-w-[280px] max-w-[280px] bg-white rounded-2xl overflow-hidden border border-[#e6e9e7] shadow-sm cursor-pointer group transition-all hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      <div className="relative h-40 overflow-hidden bg-[#e6e9e7]">
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#154212] text-white capitalize">
          {MEAL_LABELS[mealType] || mealType}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(recipe.id) }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isSaved ? 'bg-[#154212] text-white' : 'bg-white/90 text-[#42493e] hover:bg-white'
          }`}
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
            bookmark
          </span>
        </button>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-headline font-bold text-[#1a2e19] text-sm leading-tight line-clamp-2">{recipe.name}</h3>
        <div className="flex items-center gap-3 text-xs text-[#6b7c68]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {(recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0)} min
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">local_fire_department</span>
            {recipe.nutrition?.calories} kcal
          </span>
        </div>
        {recipe.ayurveda_type && (
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${gi.badge} ${gi.color}`}>
            {recipe.ayurveda_type.charAt(0).toUpperCase() + recipe.ayurveda_type.slice(1)} · {gi.label}
          </span>
        )}
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
  const { profile } = useProfileStore()
  const { toggleSave, savedRecipes } = useRecipeStore()

  const activeProfile = profile || mockUserProfile

  const rda = getRDA({
    age: activeProfile.age,
    gender: activeProfile.gender,
    weightKg: activeProfile.weight_kg ?? activeProfile.weightKg,
    healthConditions: activeProfile.health_conditions ?? activeProfile.healthConditions ?? [],
    tdee: activeProfile.tdee || activeProfile.daily_calorie_target,
  })

  const calorieTarget = rda.calories
  const proteinTarget = rda.protein_g
  const carbsTarget   = rda.carbs_g
  const fatTarget     = rda.fat_g

  const bmi     = activeProfile.bmi ?? 22.4
  const bmiInfo = getBMICategory(bmi)
  const season  = getCurrentSeason()

  const weightKg       = activeProfile.weight_kg ?? activeProfile.weightKg ?? 60
  const healthConditions = (activeProfile.health_conditions ?? activeProfile.healthConditions ?? [])
    .map((c) => c.toLowerCase())

  // ── Hydration calculation ─────────────────────────────────────────────────
  // Base: 35 ml per kg, rounded to nearest 250ml, clamped 2000–4000ml
  const baseHydration = Math.max(2000, Math.min(4000, Math.round(weightKg * 35 / 250) * 250))

  const hydrationAdjustments = useMemo(() => {
    const adj = []
    if (healthConditions.some((c) => ['pcod', 'pcos', 'diabetes'].includes(c)))
      adj.push({ label: 'PCOD/Diabetes', ml: +250 })
    if (healthConditions.some((c) => c === 'hypertension'))
      adj.push({ label: 'Hypertension', ml: +250 })
    if (healthConditions.some((c) => c.includes('kidney')))
      adj.push({ label: 'Kidney condition', ml: -500 })
    return adj
  }, [healthConditions])

  const conditionBonus      = hydrationAdjustments.reduce((s, a) => s + a.ml, 0)
  const recommendedHydration = baseHydration + conditionBonus

  const [hydrationTarget,  setHydrationTarget]  = useState(recommendedHydration)
  const [waterMl,          setWaterMl]           = useState(1250)

  const totalGlasses  = Math.round(hydrationTarget / 250)
  const filledGlasses = Math.min(totalGlasses, Math.round(waterMl / 250))
  const waterPct      = Math.min(100, Math.round((waterMl / hydrationTarget) * 100))

  // ── Vital insights — condition-based ──────────────────────────────────────
  const primaryCondition = healthConditions.find((c) => VITAL_INSIGHTS[c]) ?? 'general'
  const vitalInsights    = VITAL_INSIGHTS[primaryCondition] ?? VITAL_INSIGHTS.general

  // Top priority insight for the banner
  const topInsight = vitalInsights[0]
  const topConfig  = MICRONUTRIENT_CONFIG.find((c) => c.key === topInsight?.nutrient)
  const topIntake  = TODAY_MICRO_INTAKE[topInsight?.nutrient] ?? 0
  const topTarget  = rda[topInsight?.nutrient] ?? 1

  const mealCards = [
    { mealType: 'breakfast', recipe: mockRecommendations.breakfast?.[0] },
    { mealType: 'lunch',     recipe: mockRecommendations.lunch?.[0] },
    { mealType: 'dinner',    recipe: mockRecommendations.dinner?.[0] },
    { mealType: 'snack',     recipe: mockRecommendations.snack?.[0] },
  ]

  return (
    <div className="px-8 pt-8 pb-12 space-y-8 font-body max-w-screen-xl mx-auto">

      {/* ── Greeting ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-2xl font-black text-[#154212]">
            Namaste, {activeProfile.name?.split(' ')[0] ?? 'Friend'} 🌿
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
          SECTION 1 — Your Daily Alchemistry
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-12 gap-6">

        {/* ── Left: Macro Rings Panel (8/12) ─────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-7 border border-[#e6e9e7] shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-headline text-3xl font-black text-[#154212]">Your Daily Alchemistry</h2>
              <p className="text-xs text-[#6b7c68] mt-1">Comparing today's intake with ICMR-RDA targets</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#154212] text-white text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                {TODAY_INTAKE.calories.toLocaleString()} / {calorieTarget.toLocaleString()} kcal
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#bcf0ae] text-[#154212] text-xs font-semibold capitalize">
                <span className="material-symbols-outlined text-sm">directions_run</span>
                {(activeProfile.activity_level ?? activeProfile.activityLevel ?? 'moderate').replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
            <NutrientRing label="Calories" unit="kcal" current={TODAY_INTAKE.calories} target={calorieTarget} colorClass="text-[#154212]" strokeColor="#154212" />
            <NutrientRing label="Protein"  current={TODAY_INTAKE.protein_g} target={proteinTarget} colorClass="text-[#7c5800]"  strokeColor="#feb700" />
            <NutrientRing label="Carbs"    current={TODAY_INTAKE.carbs_g}   target={carbsTarget}   colorClass="text-[#2d5a27]"  strokeColor="#2d5a27" />
            <NutrientRing label="Fats"     current={TODAY_INTAKE.fat_g}     target={fatTarget}     colorClass="text-[#692000]"  strokeColor="#692000" />
          </div>

          <div className="mt-6 pt-5 border-t border-[#f2f4f2] grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Calories', pct: Math.min(100, Math.round((TODAY_INTAKE.calories / calorieTarget) * 100)),  color: 'bg-[#154212]' },
              { label: 'Protein',  pct: Math.min(100, Math.round((TODAY_INTAKE.protein_g / proteinTarget) * 100)), color: 'bg-[#feb700]' },
              { label: 'Carbs',    pct: Math.min(100, Math.round((TODAY_INTAKE.carbs_g / carbsTarget) * 100)),     color: 'bg-[#2d5a27]' },
              { label: 'Fats',     pct: Math.min(100, Math.round((TODAY_INTAKE.fat_g / fatTarget) * 100)),         color: 'bg-[#692000]' },
            ].map(n => (
              <div key={n.label} className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#6b7c68]">
                  <span>{n.label}</span>
                  <span className="font-semibold text-[#1a2e19]">{n.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#e6e9e7]">
                  <div className={`h-full rounded-full ${n.color} transition-all duration-700`} style={{ width: `${n.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column (4/12) ─────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

          {/* BMI Gauge Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e6e9e7] shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-base font-bold text-[#1a2e19]">BMI Status</h3>
              <span className="material-symbols-outlined text-[#154212]">monitor_weight</span>
            </div>
            <div className="relative mt-3 mb-5">
              <div className="h-4 rounded-full bg-gradient-to-r from-blue-400 via-[#154212] via-50% to-red-500 relative overflow-visible">
                <div
                  className="absolute -top-1 w-5 h-5 rounded-full bg-white border-2 border-[#154212] shadow-md transition-all duration-700 -translate-x-1/2"
                  style={{ left: `${bmiInfo.position}%` }}
                />
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

          {/* ── Enhanced Hydration Card ──────────────────────────────────── */}
          <div className="rounded-3xl p-6 shadow-sm" style={{ background: '#1a3a18', color: 'white' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline text-base font-bold text-white">Hydration Path</h3>
              <span className="material-symbols-outlined text-[#bcf0ae] text-xl">water_drop</span>
            </div>

            {/* Body-weight based info */}
            <p className="text-[10px] text-white/50 mb-3">
              Base: {weightKg} kg × 35 ml = {baseHydration} ml
              {hydrationAdjustments.map((a, i) => (
                <span key={i}> · {a.label} {a.ml > 0 ? `+${a.ml}` : a.ml} ml</span>
              ))}
            </p>

            {/* Consumed / Target */}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-headline text-3xl font-black text-white">{waterMl}</span>
              <span className="text-white/60 text-sm">/ {hydrationTarget} ml</span>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${waterPct >= 80 ? 'bg-[#bcf0ae] text-[#154212]' : waterPct >= 50 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                {waterPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-white/15 mb-4">
              <div className="h-full rounded-full bg-[#bcf0ae] transition-all duration-700" style={{ width: `${waterPct}%` }} />
            </div>

            {/* Dynamic glass grid */}
            <div className={`grid gap-1 mb-4`} style={{ gridTemplateColumns: `repeat(${Math.min(totalGlasses, 8)}, 1fr)` }}>
              {Array.from({ length: totalGlasses }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWaterMl((i + 1) * 250)}
                  title={`${(i + 1) * 250} ml`}
                  className={`h-5 rounded transition-all ${
                    i < filledGlasses ? 'bg-white/40 hover:bg-white/60' : 'bg-white/10 hover:bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* +250ml / custom target buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setWaterMl(Math.min(hydrationTarget, waterMl + 250))}
                className="flex-1 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                +250 ml
              </button>
              <button
                onClick={() => setHydrationTarget(Math.max(1500, hydrationTarget - 250))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-all"
                title="Decrease target"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <button
                onClick={() => setHydrationTarget(Math.min(5000, hydrationTarget + 250))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-all"
                title="Increase target"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <p className="text-[10px] text-white/40 text-center mt-2">Tap ±250ml to customise your daily target</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Vital Insight Banner (condition-specific)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl px-6 py-5 border border-[#ffdbcf] flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: '#ffdbcf' }}>
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#692000]/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[#692000]">
              {topConfig?.icon || 'warning'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-[#692000] text-sm">
              Vital Insight: Low {topConfig?.label ?? 'Nutrient'}
              {' '}({Math.round((topIntake / topTarget) * 100)}% of RDA)
            </p>
            <p className="text-xs text-[#692000]/70 mt-0.5 leading-relaxed max-w-lg">
              {topInsight?.message}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => navigate('/recipes?tag=iron-rich')}
                className="px-4 py-2 bg-[#692000] text-white rounded-xl text-xs font-semibold hover:bg-[#8a3010] transition-all"
              >
                See {topConfig?.label}-rich recipes
              </button>
              <button
                onClick={() => navigate('/food-combinations')}
                className="px-4 py-2 bg-[#692000]/10 text-[#692000] border border-[#692000]/30 rounded-xl text-xs font-semibold hover:bg-[#692000]/20 transition-all"
              >
                Food Synergy Guide
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/chatbot')}
          className="shrink-0 px-5 py-2.5 bg-white text-[#692000] rounded-xl text-sm font-semibold border border-[#692000]/20 hover:bg-[#fff5f2] transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
        >
          <span className="material-symbols-outlined text-base">healing</span>
          Ask AarogyaAI
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Vital Nutrients Tracker (Micronutrients + DHA)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-3xl p-7 border border-[#e6e9e7] shadow-sm">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-headline text-2xl font-bold text-[#1a2e19]">Vital Nutrients Tracker</h2>
            <p className="text-xs text-[#6b7c68] mt-1">Essential micronutrients tracked against ICMR-NIN 2020 RDA — personalised for your conditions</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {vitalInsights.slice(0, 2).map((insight, i) => {
              const cfg = MICRONUTRIENT_CONFIG.find((c) => c.key === insight.nutrient)
              const pct = rda[insight.nutrient] > 0 ? Math.round((TODAY_MICRO_INTAKE[insight.nutrient] ?? 0) / rda[insight.nutrient] * 100) : 0
              return cfg ? (
                <span
                  key={i}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '33' }}
                >
                  {cfg.label}: {pct}% RDA
                </span>
              ) : null
            })}
          </div>
        </div>

        {/* Condition-specific suggested nutrients banner */}
        <div className="mb-5 p-3 rounded-xl bg-[#f8faf8] border border-[#e6e9e7] flex items-start gap-3">
          <span className="material-symbols-outlined text-[#154212] mt-0.5">tips_and_updates</span>
          <div>
            <p className="text-xs font-semibold text-[#1a2e19]">Suggested Focus for {primaryCondition === 'general' ? 'Optimal Health' : primaryCondition.toUpperCase()}</p>
            <p className="text-xs text-[#6b7c68] mt-0.5">
              {vitalInsights.map((v) => MICRONUTRIENT_CONFIG.find((c) => c.key === v.nutrient)?.label).filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {MICRONUTRIENT_CONFIG.map((cfg) => {
            const intake  = TODAY_MICRO_INTAKE[cfg.key] ?? 0
            const target  = rda[cfg.key] ?? 1
            const highlighted = vitalInsights.some((v) => v.nutrient === cfg.key)
            return (
              <NutrientMiniCard
                key={cfg.key}
                config={cfg}
                intake={intake}
                target={target}
                isHighlighted={highlighted}
              />
            )
          })}
        </div>

        {/* Condition-specific insights list */}
        <div className="mt-6 pt-5 border-t border-[#f2f4f2] space-y-3">
          <p className="text-xs font-semibold text-[#6b7c68] uppercase tracking-wider">Personalised Nutrient Recommendations</p>
          {vitalInsights.map((insight, i) => {
            const cfg = MICRONUTRIENT_CONFIG.find((c) => c.key === insight.nutrient)
            const intake = TODAY_MICRO_INTAKE[insight.nutrient] ?? 0
            const target = rda[insight.nutrient] ?? 1
            const pct    = Math.min(100, Math.round((intake / target) * 100))
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f8faf8] transition-colors">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: cfg?.bg || '#f0f0f0' }}
                >
                  <span className="material-symbols-outlined text-sm" style={{ color: cfg?.color || '#333' }}>
                    {cfg?.icon || 'info'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-[#1a2e19]">{cfg?.label ?? insight.nutrient}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      insight.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'high'     ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.priority}
                    </span>
                    <span className="text-[10px] text-[#6b7c68] ml-auto">{pct}% of RDA</span>
                  </div>
                  <p className="text-xs text-[#42493e] leading-relaxed">{insight.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — Today's Alchemist Menu
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-black text-[#1a2e19]">Today's Alchemist Menu</h2>
            <p className="text-xs text-[#6b7c68] mt-0.5">AI-curated for your body, region & season</p>
          </div>
          <button
            onClick={() => navigate('/meal-planner')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#154212] text-[#154212] text-sm font-semibold hover:bg-[#154212] hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-base">calendar_month</span>
            Full Weekly Plan
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {mealCards.map(({ mealType, recipe }) => (
            <MealCard
              key={mealType}
              recipe={recipe}
              mealType={mealType}
              isSaved={savedRecipes.includes(recipe?.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — Weekly Trend (Recharts)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-[#e6e9e7] shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-headline text-xl font-bold text-[#1a2e19]">7-Day Calorie Trend</h2>
              <p className="text-xs text-[#6b7c68] mt-0.5">This week's energy intake vs target ({calorieTarget.toLocaleString()} kcal)</p>
            </div>
            <span className="material-symbols-outlined text-[#154212]">insights</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEK_DATA} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7c68', fontFamily: 'Inter' }} />
              <YAxis domain={[1400, 2500]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9187', fontFamily: 'Inter' }} tickCount={4} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#e6e9e7', radius: 8 }} />
              <Bar dataKey="kcal" radius={[8, 8, 4, 4]}>
                {WEEK_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.day === 'Fri' ? '#154212' : entry.kcal > calorieTarget ? '#ffdbcf' : '#bcf0ae'} stroke={entry.day === 'Fri' ? '#154212' : 'none'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4 text-xs text-[#6b7c68] flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#bcf0ae] inline-block" />Within target</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#ffdbcf] inline-block" />Over target</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#154212] inline-block" />Today</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#e6e9e7] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#bcf0ae] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#154212] text-lg">show_chart</span>
              </div>
              <p className="text-sm font-semibold text-[#1a2e19]">Week Average</p>
            </div>
            <p className="font-headline text-3xl font-black text-[#154212]">
              {Math.round(WEEK_DATA.reduce((s, d) => s + d.kcal, 0) / WEEK_DATA.length).toLocaleString()}
            </p>
            <p className="text-xs text-[#6b7c68] mt-0.5">kcal / day this week</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e6e9e7] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#feb700]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#7c5800] text-lg">local_fire_department</span>
              </div>
              <p className="text-sm font-semibold text-[#1a2e19]">Logging Streak</p>
            </div>
            <p className="font-headline text-3xl font-black text-[#7c5800]">7</p>
            <p className="text-xs text-[#6b7c68] mt-0.5">consecutive days logged</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#e6e9e7] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#2d5a27] text-lg">favorite</span>
              </div>
              <p className="text-sm font-semibold text-[#1a2e19]">Today's Health Score</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="font-headline text-3xl font-black text-[#2d5a27]">78</p>
              <p className="text-sm text-[#6b7c68] mb-0.5">/ 100</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[#e6e9e7]">
              <div className="h-full rounded-full bg-[#2d5a27] transition-all duration-700" style={{ width: '78%' }} />
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
