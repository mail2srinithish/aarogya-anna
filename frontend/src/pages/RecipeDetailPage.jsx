import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import mockRecipes from '../data/mockRecipes'
import foodsDb from '../data/foodsDb/index.js'
import { fetchMealById, transformMeal } from '../services/mealDbService'
import { fetchOFFProductByCode } from '../services/openFoodFactsService'
import { useRecipeStore } from '../store/recipeStore'
import { useProfileStore } from '../store/profileStore'
import { getRDA, getRDAPercent, NUTRIENT_LABELS, NUTRIENT_UNITS } from '../utils/rda'
import { useFoodImage } from '../hooks/useFoodImage'
import { CATEGORY_GRADIENTS } from '../utils/foodImageMap'
import { getGILabel, getHealthCompatibility } from '../utils/healthScore'
import AddToPlanModal from '../components/common/AddToPlanModal'

// ─── Constants ────────────────────────────────────────────────────────────────

const MACRO_KEYS = [
  'calories', 'protein_g', 'carbs_g', 'fat_g',
  'fiber_g', 'sugar_g', 'saturated_fat_g', 'trans_fat_g', 'cholesterol_mg',
]

const MICRO_KEYS = [
  'sodium_mg', 'potassium_mg', 'calcium_mg', 'iron_mg', 'magnesium_mg',
  'zinc_mg', 'phosphorus_mg', 'vitamin_a_mcg', 'vitamin_c_mg',
  'vitamin_d_mcg', 'vitamin_b12_mcg', 'folate_mcg',
]

// Keys that have no RDA in ICMR (show — in % column)
const NO_RDA_KEYS = new Set(['trans_fat_g', 'cholesterol_mg'])

// Diet badge colours
const DIET_COLORS = {
  vegetarian:     'bg-green-100 text-green-700 border-green-200',
  vegan:          'bg-emerald-100 text-emerald-700 border-emerald-200',
  'non-vegetarian': 'bg-red-100 text-red-700 border-red-200',
  jain:           'bg-orange-100 text-orange-700 border-orange-200',
  eggetarian:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  sattvic:        'bg-violet-100 text-violet-700 border-violet-200',
}

// Difficulty display
const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val, decimals = 1) {
  if (val === undefined || val === null) return '—'
  return Number(val).toFixed(decimals)
}

function rdaColorClass(pct) {
  if (pct === null || pct === undefined) return 'text-on-surface-variant'
  if (pct >= 70) return 'text-primary font-semibold'
  if (pct >= 30) return 'text-secondary font-medium'
  return 'text-tertiary'
}

function rdaBgClass(pct) {
  if (pct === null || pct === undefined) return ''
  if (pct >= 70) return 'bg-primary/10'
  if (pct >= 30) return 'bg-secondary/10'
  return 'bg-tertiary/10'
}

function scoreColorClass(score) {
  if (score >= 80) return 'bg-primary text-on-primary'
  if (score >= 60) return 'bg-yellow-500 text-white'
  return 'bg-red-500 text-white'
}

function prepDisplay(mins) {
  if (!mins && mins !== 0) return '—'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({ icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 bg-surface-container rounded-xl px-3 py-2">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-xs text-on-surface-variant leading-none">{label}</p>
        <p className="text-sm font-semibold text-on-surface leading-tight">{value}</p>
      </div>
    </div>
  )
}

function TagBadge({ label, colorClass = 'bg-surface-container text-on-surface-variant border-surface-container-high' }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${colorClass}`}>
      {label}
    </span>
  )
}

// Rating stars
function RatingStars({ rating }) {
  const full    = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-lg leading-none ${
            i < full ? 'text-amber-400'
            : i === full && hasHalf ? 'text-amber-300'
            : 'text-surface-container-high'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ─── Nutrition Table ──────────────────────────────────────────────────────────

function NutritionTable({ nutrition, servings, profile, isFoodItem = false }) {
  const [mode, setMode] = useState(isFoodItem ? '100g' : 'serving')

  const getNutrientValue = (key) => {
    const base = nutrition?.[key]
    if (base === undefined || base === null) return null
    if (!isFoodItem && mode === '100g') {
      return Number((base / 150) * 100)
    }
    return Number(base)
  }

  const renderRows = (keys) =>
    keys.map((key) => {
      const label  = NUTRIENT_LABELS[key]
      const unit   = NUTRIENT_UNITS[key]
      if (!label) return null

      const val    = getNutrientValue(key)
      const noRDA  = NO_RDA_KEYS.has(key)
      const pct    = noRDA || val === null ? null : getRDAPercent(key, val, profile)

      return (
        <tr key={key} className="border-b border-surface-container-high last:border-0 hover:bg-surface-container/40 transition-colors">
          <td className="py-2 pr-4 text-sm text-on-surface">{label}</td>
          <td className="py-2 pr-4 text-sm text-on-surface font-medium text-right tabular-nums">
            {val !== null ? `${key === 'calories' ? Math.round(val) : fmt(val)} ${unit}` : '—'}
          </td>
          <td className="py-2 text-right">
            {pct !== null ? (
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full ${rdaBgClass(pct)} ${rdaColorClass(pct)}`}>
                {pct}%
              </span>
            ) : (
              <span className="text-xs text-on-surface-variant">—</span>
            )}
          </td>
        </tr>
      )
    })

  const giInfo = getGILabel(nutrition?.glycemic_index)

  return (
    <div>
      {/* Toggle — hidden for food items (always per 100g) */}
      {!isFoodItem && (
        <div className="flex gap-1 mb-4 p-1 bg-surface-container rounded-xl w-fit">
          {[
            { key: 'serving', label: 'Per Serving' },
            { key: '100g',    label: 'Per 100g'    },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${mode === key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {isFoodItem && (
        <p className="text-xs text-on-surface-variant mb-4 inline-block bg-surface-container px-3 py-1 rounded-full">Per 100g</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[280px]">
          <thead>
            <tr className="border-b-2 border-surface-container-high">
              <th className="pb-2 text-xs uppercase tracking-wide text-on-surface-variant font-semibold">Nutrient</th>
              <th className="pb-2 text-xs uppercase tracking-wide text-on-surface-variant font-semibold text-right">Amount</th>
              <th className="pb-2 text-xs uppercase tracking-wide text-on-surface-variant font-semibold text-right">% RDA</th>
            </tr>
          </thead>
          <tbody>
            {/* Macronutrients section */}
            <tr>
              <td colSpan={3} className="pt-3 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Macronutrients</span>
              </td>
            </tr>
            {renderRows(MACRO_KEYS)}

            {/* Micronutrients section */}
            <tr>
              <td colSpan={3} className="pt-4 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Micronutrients</span>
              </td>
            </tr>
            {renderRows(MICRO_KEYS)}
          </tbody>
        </table>
      </div>

      {/* GI Badge */}
      {nutrition?.glycemic_index && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-on-surface-variant">Glycemic Index:</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${giInfo.badge} ${giInfo.color}`}>
            {nutrition.glycemic_index} — {giInfo.label}
          </span>
        </div>
      )}

      {/* Source footnote */}
      <p className="mt-4 text-[11px] text-on-surface-variant/60 leading-relaxed">
        % based on ICMR-NIN 2020 RDA for an adult (2000 kcal). Values are per serving unless toggled.
      </p>
    </div>
  )
}

// ─── Health Compatibility ─────────────────────────────────────────────────────

function HealthCompatibility({ recipe, userProfile }) {
  const activeProfile = userProfile || mockUserProfile
  if (!activeProfile) return null

  const compatibility = getHealthCompatibility(recipe, {
    healthConditions: activeProfile.health_conditions || activeProfile.healthConditions || [],
    allergies:        activeProfile.allergies || [],
  })

  if (!compatibility) return null
  const { warnings = [], safe = [] } = compatibility
  if (!warnings.length && !safe.length) return null

  return (
    <div className="mt-4">
      <h3 className="font-headline font-bold text-on-surface mb-3 text-base">Health Compatibility</h3>
      <div className="flex flex-col gap-2">
        {safe.map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-xl p-3">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">check_circle</span>
            <p className="text-sm text-on-surface leading-snug">{item.msg}</p>
          </div>
        ))}
        {warnings.map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-secondary/10 border border-secondary/30 rounded-xl p-3">
            <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 flex-shrink-0">warning</span>
            <p className="text-sm text-on-surface leading-snug">{item.msg}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Similar Recipes (Mini Card) ──────────────────────────────────────────────

function MiniRecipeCard({ recipe }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  return (
    <article
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="flex items-center gap-3 bg-surface-container-lowest border border-surface-container-high
                 rounded-xl p-2.5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all min-w-[220px] max-w-[240px]"
    >
      {/* Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
        {!imgError ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl">restaurant</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface line-clamp-1">{recipe.name}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">
          {recipe.nutrition?.calories} kcal · {recipe.prep_time_mins}m
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${scoreColorClass(recipe.health_score)} `}>
            {recipe.health_score}
          </span>
          <span className="text-[10px] text-amber-400">★</span>
          <span className="text-[10px] text-on-surface-variant">{recipe.rating}</span>
        </div>
      </div>
    </article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecipeDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { savedRecipes, toggleSave } = useRecipeStore()
  const { profile }                  = useProfileStore()

  // ── Lookup: static data first ──────────────────────────────────────────
  const allStatic = useMemo(() => [...mockRecipes, ...foodsDb], [])
  const staticItem = allStatic.find((r) => String(r.id) === String(id))

  // ── For TheMealDB IDs, fetch from API ──────────────────────────────────
  const isMealDbId = String(id).startsWith('mdb_')
  const mealDbNumId = isMealDbId ? String(id).replace('mdb_', '') : null

  const { data: fetchedMeal, isLoading: loadingMeal } = useQuery({
    queryKey: ['meal', mealDbNumId],
    queryFn: async () => {
      const raw = await fetchMealById(mealDbNumId)
      return raw ? transformMeal(raw) : null
    },
    enabled: !!mealDbNumId && !staticItem,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })

  // ── For Open Food Facts IDs, fetch product by barcode ─────────────────
  const isOFFId   = String(id).startsWith('off_')
  const offCode   = isOFFId ? String(id).replace(/^off_/, '') : null

  const { data: offProduct, isLoading: loadingOFF } = useQuery({
    queryKey: ['offProduct', offCode],
    queryFn: () => fetchOFFProductByCode(offCode),
    enabled: !!offCode && !staticItem,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })

  const recipe     = staticItem || fetchedMeal || offProduct
  const isFoodItem = recipe?.source === 'food_item'
  const isSaved    = savedRecipes.includes(recipe?.id)

  // ── State ──────────────────────────────────────────────────────────────
  const [scale, setScale]           = useState(1)
  const [checkedIngredients, setCheckedIngredients] = useState(new Set())
  const [imgError, setImgError]     = useState(false)
  const [addToPlanOpen, setAddToPlanOpen] = useState(false)

  const toggleIngredient = (idx) =>
    setCheckedIngredients((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })

  // Similar items: for food items → same category; for recipes → same region
  const similarItems = useMemo(() => {
    if (!recipe) return []
    if (isFoodItem) {
      return foodsDb
        .filter((f) => f.id !== recipe.id && f.category === recipe.category)
        .slice(0, 6)
    }
    return [...mockRecipes, ...foodsDb]
      .filter((r) => r.id !== recipe.id && r.region === recipe.region && r.source !== 'food_item')
      .slice(0, 6)
  }, [recipe, isFoodItem])

  const activeProfile = profile || null

  // ── Loading (TheMealDB or OFF fetch in progress) ─────────────────────
  if (((loadingMeal && isMealDbId) || (loadingOFF && isOFFId)) && !staticItem) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-on-surface-variant text-sm">Loading recipe...</p>
      </div>
    )
  }

  // ── 404 ─────────────────────────────────────────────────────────────────
  if (!recipe) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">restaurant_menu</span>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Recipe Not Found</h2>
        <p className="text-on-surface-variant">The recipe you are looking for does not exist.</p>
        <button
          onClick={() => navigate('/recipes')}
          className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to Recipes
        </button>
      </div>
    )
  }

  const giInfo = getGILabel(recipe.nutrition?.glycemic_index)
  const requiredIngredients = recipe.ingredients?.filter((i) => !i.optional) || []
  const optionalIngredients = recipe.ingredients?.filter((i) => i.optional)  || []

  // ── FOOD ITEM HERO ────────────────────────────────────────────────────────
  function FoodItemHero({ recipe: r, isSaved: sv, onSave, onAddToPlan, scoreColorClass: scFn, CATEGORY_LABELS: CL }) {
    const { imageUrl, isLoading: imgLoad } = useFoodImage(r)
    const [imgErr, setImgErr] = useState(false)
    const grad = CATEGORY_GRADIENTS[r.category] || 'from-surface-container to-surface-container-high'
    const showImg = imageUrl && !imgErr
    return (
      <div className="relative h-52 sm:h-72 rounded-2xl overflow-hidden mb-6 shadow-md">
        {imgLoad && !showImg && <div className={`w-full h-full bg-gradient-to-br ${grad} animate-pulse`} />}
        {showImg && (
          <img src={imageUrl} alt={r.name} className="w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        )}
        {!showImg && !imgLoad && (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${grad}`}>
            <span className="text-8xl sm:text-9xl select-none">{r.food_emoji || '🍽️'}</span>
          </div>
        )}
        {/* dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className={`text-sm font-black px-3 py-1.5 rounded-xl shadow-lg ${scFn(r.health_score)}`}>
            Health Score {r.health_score}
          </span>
          {r.category && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/50 text-white backdrop-blur-sm">
              {CL[r.category] || r.category}
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={onAddToPlan}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors backdrop-blur-sm bg-secondary-container text-secondary border-secondary/30 hover:bg-secondary hover:text-white">
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            Add to Plan
          </button>
          <button onClick={onSave}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors backdrop-blur-sm
              ${sv ? 'bg-primary text-on-primary border-primary' : 'bg-black/30 text-white border-white/20 hover:border-primary hover:bg-primary hover:text-on-primary'}`}>
            <span className="material-symbols-outlined text-[16px]">{sv ? 'bookmark' : 'bookmark_border'}</span>
            {sv ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  // ── FOOD ITEM VIEW ────────────────────────────────────────────────────────
  if (isFoodItem) {
    const CATEGORY_LABELS = {
      fruit: 'Fruit', vegetable: 'Vegetable', legume: 'Legume', nut_seed: 'Nut & Seed',
      grain: 'Grain & Cereal', millet: 'Millet', dairy: 'Dairy', fermented: 'Fermented',
      spice: 'Spice & Herb', herb: 'Herb', dish: 'Dish', sweet: 'Sweet',
      snack: 'Snack', beverage: 'Beverage', meat: 'Meat', seafood: 'Fish & Seafood',
      egg: 'Egg', oil: 'Oil & Fat', condiment: 'Condiment', bread: 'Bread',
    }
    return (
      <div className="min-h-screen bg-surface">
        <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">

          {/* Back */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Recipes
          </button>

          {/* Hero */}
          <FoodItemHero recipe={recipe} isSaved={isSaved} onSave={() => toggleSave(recipe.id)} onAddToPlan={() => setAddToPlanOpen(true)} scoreColorClass={scoreColorClass} CATEGORY_LABELS={CATEGORY_LABELS} />

          {/* Title */}
          <div className="mb-6">
            <h1 className="font-headline text-3xl sm:text-4xl font-black text-primary leading-tight">{recipe.name}</h1>
            {recipe.name_regional && <p className="text-xl text-on-surface-variant mt-1 font-body">{recipe.name_regional}</p>}
            {recipe.description && <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-2xl">{recipe.description}</p>}
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-1.5 bg-surface-container rounded-xl px-3 py-2">
              <span className="text-base">🔥</span>
              <div><p className="text-xs text-on-surface-variant">Calories</p><p className="text-sm font-semibold">{recipe.nutrition?.calories ?? '—'} kcal</p></div>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container rounded-xl px-3 py-2">
              <span className="text-base">💪</span>
              <div><p className="text-xs text-on-surface-variant">Protein</p><p className="text-sm font-semibold">{recipe.nutrition?.protein_g ?? '—'}g</p></div>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container rounded-xl px-3 py-2">
              <span className="text-base">🌾</span>
              <div><p className="text-xs text-on-surface-variant">Carbs</p><p className="text-sm font-semibold">{recipe.nutrition?.carbs_g ?? '—'}g</p></div>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container rounded-xl px-3 py-2">
              <span className="text-base">🫀</span>
              <div><p className="text-xs text-on-surface-variant">Fiber</p><p className="text-sm font-semibold">{recipe.nutrition?.fiber_g ?? '—'}g</p></div>
            </div>
            {recipe.nutrition?.glycemic_index > 0 && (
              <div className="flex items-center gap-1.5 bg-surface-container rounded-xl px-3 py-2">
                <span className="text-base">📊</span>
                <div>
                  <p className="text-xs text-on-surface-variant">GI</p>
                  <p className="text-sm font-semibold">{recipe.nutrition.glycemic_index} — {giInfo.label}</p>
                </div>
              </div>
            )}
          </div>

          {/* Health tags */}
          {recipe.health_tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {recipe.health_tags.map((t) => (
                <TagBadge key={t} label={t} colorClass="bg-primary/10 text-primary border-primary/20" />
              ))}
            </div>
          )}

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

            {/* Left: Nutrition table */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="font-headline font-bold text-on-surface text-xl mb-1">Nutritional Info</h2>
                <p className="text-xs text-on-surface-variant mb-4">Per 100g · ICMR-NIN 2020 source</p>
                <NutritionTable nutrition={recipe.nutrition} servings={1} profile={activeProfile} isFoodItem={true} />
              </div>

              {/* Ayurvedic & how to use */}
              <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-sm">
                <h2 className="font-headline font-bold text-on-surface text-lg mb-3">How to Use</h2>
                <div className="space-y-2">
                  {recipe.meal_type && recipe.meal_type !== 'any' && (
                    <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                      <p className="text-sm text-on-surface">
                        Best for <strong>{Array.isArray(recipe.meal_type) ? recipe.meal_type.join(', ') : recipe.meal_type}</strong>
                      </p>
                    </div>
                  )}
                  {recipe.ayurveda_type && (
                    <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                      <span className="material-symbols-outlined text-violet-600 text-[20px]">spa</span>
                      <p className="text-sm text-violet-800">Ayurveda: <strong>{recipe.ayurveda_type}</strong> type food</p>
                    </div>
                  )}
                  {recipe.season_tags?.filter((s) => s !== 'all-year').length > 0 && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">wb_sunny</span>
                      <p className="text-sm text-amber-800">Best in season: <strong>{recipe.season_tags.join(', ')}</strong></p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: health compatibility + similar */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-sm">
                <HealthCompatibility recipe={recipe} userProfile={activeProfile} />
                {recipe.diet_type?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-surface-container-high">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Diet Type</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.diet_type.map((d) => (
                        <TagBadge key={d} label={d} colorClass={DIET_COLORS[d] || 'bg-surface-container text-on-surface-variant border-surface-container-high'} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Similar foods in same category */}
              {similarItems.length > 0 && (
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-on-surface mb-3 text-base">More {CATEGORY_LABELS[recipe.category] || 'Foods'}</h3>
                  <div className="space-y-2">
                    {similarItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/recipes/${item.id}`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container transition-colors text-left"
                      >
                        <span className="text-2xl flex-shrink-0">{item.food_emoji || '🍽️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{item.name}</p>
                          <p className="text-xs text-on-surface-variant">{item.nutrition?.calories ?? '—'} kcal · HS {item.health_score}</p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-[16px] flex-shrink-0">chevron_right</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface">
      <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">

        {/* ── SECTION A: HERO HEADER ──────────────────────────────────────── */}
        <section className="mb-8">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Recipes
          </button>

          {/* Hero image */}
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-surface-container mb-6 shadow-sm">
            {!imgError ? (
              <img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container">
                <span className="material-symbols-outlined text-7xl text-on-surface-variant/25">restaurant</span>
              </div>
            )}
            {/* Score overlay */}
            <div className="absolute bottom-4 left-4">
              <span className={`text-sm font-black px-3 py-1.5 rounded-xl shadow-lg ${scoreColorClass(recipe.health_score)}`}>
                Health Score {recipe.health_score}
              </span>
            </div>
          </div>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-headline text-3xl sm:text-4xl font-black text-primary leading-tight">
                {recipe.name}
              </h1>
              {recipe.name_regional && (
                <p className="text-xl text-on-surface-variant mt-1 font-body">{recipe.name_regional}</p>
              )}
              {recipe.description && (
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-2xl">
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setAddToPlanOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-secondary/30 bg-secondary-container text-secondary hover:bg-secondary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Add to Plan
              </button>
              <button
                onClick={() => toggleSave(recipe.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors
                  ${isSaved
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface border-surface-container-high hover:border-primary hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSaved ? 'bookmark' : 'bookmark_border'}
                </span>
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: recipe.name, url: window.location.href })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-surface-container-high
                           bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                Share
              </button>
            </div>
          </div>

          {/* Tag badges row */}
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.meal_type && (
              <TagBadge label={recipe.meal_type.charAt(0).toUpperCase() + recipe.meal_type.slice(1)} />
            )}
            {recipe.diet_type?.map((d) => (
              <TagBadge
                key={d}
                label={d.charAt(0).toUpperCase() + d.slice(1)}
                colorClass={DIET_COLORS[d] || 'bg-surface-container text-on-surface-variant border-surface-container-high'}
              />
            ))}
            {recipe.state && (
              <TagBadge label={recipe.state} colorClass="bg-blue-50 text-blue-700 border-blue-200" />
            )}
            {recipe.ayurveda_type && (
              <TagBadge label={`Ayurveda: ${recipe.ayurveda_type}`} colorClass="bg-violet-50 text-violet-700 border-violet-200" />
            )}
            {recipe.season_tags?.map((s) => (
              <TagBadge key={s} label={s} colorClass="bg-amber-50 text-amber-700 border-amber-200" />
            ))}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-2 mt-5">
            <div className="flex items-center gap-2">
              <RatingStars rating={recipe.rating} />
              <span className="text-sm font-semibold text-on-surface">{recipe.rating}</span>
            </div>
            <StatBadge icon="👤" value={recipe.reviews?.toLocaleString()} label="Reviews"  />
            <StatBadge icon="⏱"  value={prepDisplay(recipe.prep_time_mins)} label="Prep"    />
            <StatBadge icon="🍳" value={prepDisplay(recipe.cook_time_mins)} label="Cook"    />
            <StatBadge icon="👥" value={recipe.servings}                    label="Servings" />
            {recipe.difficulty && (
              <StatBadge icon="📊" value={DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty} label="Difficulty" />
            )}
          </div>
        </section>

        {/* ── SECTION B: TWO-COLUMN ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

          {/* ── LEFT (7/12) ── */}
          <div className="lg:col-span-7 flex flex-col gap-8">

            {/* 1. Ingredients */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline font-bold text-on-surface text-xl">Ingredients</h2>

                {/* Scale toggle */}
                <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl">
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors
                        ${scale === s
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      {s}×
                    </button>
                  ))}
                  <span className="ml-1 text-xs text-on-surface-variant pr-1">Scale</span>
                </div>
              </div>

              {/* Required ingredients */}
              <div className="flex flex-col gap-2">
                {requiredIngredients.map((ing, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                      ${checkedIngredients.has(idx) ? 'bg-surface-container opacity-60' : 'hover:bg-surface-container/50'}`}
                  >
                    <span
                      onClick={() => toggleIngredient(idx)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                        ${checkedIngredients.has(idx)
                          ? 'bg-primary border-primary text-on-primary'
                          : 'border-outline'}`}
                    >
                      {checkedIngredients.has(idx) && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </span>
                    <span className={`text-sm flex-1 ${checkedIngredients.has(idx) ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                      <span className="font-semibold tabular-nums">
                        {ing.quantity != null
                          ? Number((ing.quantity * scale).toFixed(2)).toString()
                          : ''}{' '}
                        {ing.unit}
                      </span>
                      {' '}
                      {ing.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* Optional ingredients */}
              {optionalIngredients.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-container-high">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Optional</p>
                  <div className="flex flex-col gap-2">
                    {optionalIngredients.map((ing, idx) => {
                      const globalIdx = requiredIngredients.length + idx
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                            ${checkedIngredients.has(globalIdx) ? 'bg-surface-container opacity-60' : 'hover:bg-surface-container/50'}`}
                        >
                          <span
                            onClick={() => toggleIngredient(globalIdx)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                              ${checkedIngredients.has(globalIdx)
                                ? 'bg-primary border-primary text-on-primary'
                                : 'border-outline'}`}
                          >
                            {checkedIngredients.has(globalIdx) && (
                              <span className="material-symbols-outlined text-[14px]">check</span>
                            )}
                          </span>
                          <span className={`text-sm flex-1 ${checkedIngredients.has(globalIdx) ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                            <span className="font-semibold">
                              {ing.quantity != null
                                ? Number((ing.quantity * scale).toFixed(2)).toString()
                                : ''}{' '}
                              {ing.unit}
                            </span>
                            {' '}
                            {ing.name}
                            <span className="ml-1.5 text-[11px] text-on-surface-variant italic">(Optional)</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Preparation Steps */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="font-headline font-bold text-on-surface text-xl mb-5">Preparation Steps</h2>
              <ol className="flex flex-col gap-4">
                {recipe.steps?.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    {/* Step number circle */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold mt-0.5">
                      {step.step ?? idx + 1}
                    </div>
                    <div className="flex-1 bg-surface-container/40 rounded-xl p-4">
                      <p className="text-sm text-on-surface leading-relaxed">{step.text || step.instruction}</p>
                      {step.time && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">schedule</span>
                          <span className="text-[11px] text-on-surface-variant">~{step.time} min</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              {/* Tips */}
              {recipe.tips && (
                <div className="mt-5 p-4 bg-primary/8 border border-primary/20 rounded-xl">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Tips &amp; Notes</p>
                  <p className="text-sm text-on-surface leading-relaxed">{recipe.tips}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT (5/12) ── */}
          <div className="lg:col-span-5 flex flex-col gap-8">

            {/* 3. Nutrition Table */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="font-headline font-bold text-on-surface text-xl mb-1">Nutritional Info</h2>
              <p className="text-xs text-on-surface-variant mb-4">Per serving · {recipe.servings} servings total</p>

              <NutritionTable
                nutrition={recipe.nutrition}
                servings={recipe.servings}
                profile={activeProfile}
                isFoodItem={false}
              />
            </div>

            {/* 4. Health Compatibility */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5 sm:p-6 shadow-sm">
              <HealthCompatibility recipe={recipe} userProfile={activeProfile} />

              {/* Cuisine tags */}
              {recipe.cuisine_tags?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-surface-container-high">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Cuisine</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.cuisine_tags.map((t) => (
                      <TagBadge key={t} label={t} colorClass="bg-surface-container text-on-surface-variant border-surface-container-high" />
                    ))}
                  </div>
                </div>
              )}

              {/* Health tags */}
              {recipe.health_tags?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-container-high">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Health Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.health_tags.map((t) => (
                      <TagBadge key={t} label={t} colorClass="bg-primary/10 text-primary border-primary/20" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION C: SIMILAR RECIPES ──────────────────────────────────── */}
        {similarItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-headline font-bold text-on-surface text-2xl">
                  More from {recipe.state}
                </h2>
                {recipe.health_tags?.[0] && (
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    More {recipe.health_tags[0]} Recipes
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate('/recipes')}
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
              >
                View all
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {similarItems.map((r) => (
                <MiniRecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Add to Plan modal */}
      {addToPlanOpen && recipe && (
        <AddToPlanModal item={recipe} onClose={() => setAddToPlanOpen(false)} />
      )}
    </div>
  )
}
