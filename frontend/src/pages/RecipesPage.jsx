import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import mockRecipes from '../data/mockRecipes'
import { useRecipeStore } from '../store/recipeStore'
import { useProfileStore } from '../store/profileStore'
import { calcHealthScore } from '../utils/healthScore'
import { fetchMoreIndianRecipes } from '../services/mealDbService'
import { searchOFFWithFallback } from '../services/openFoodFactsService'
import { searchUSDA } from '../services/usdaService'
import { expandSearchTerms, foodMatchesQuery } from '../utils/searchNormalize'
import AddToPlanModal from '../components/common/AddToPlanModal'
import { useFoodImage } from '../hooks/useFoodImage'
import { CATEGORY_GRADIENTS } from '../utils/foodImageMap'

import foodsDb from '../data/foodsDb/index.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const MEAL_TYPES    = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
const DIET_TYPES    = ['Vegetarian', 'Vegan', 'Jain', 'Non-Vegetarian', 'Eggetarian', 'Sattvic']
const REGIONS       = ['South Indian', 'North Indian', 'East Indian', 'West Indian', 'Northeast']
const HEALTH_TAGS   = [
  // Metabolic & Condition-based
  'Diabetic-Friendly', 'PCOD-Friendly', 'Thyroid-Support', 'Heart-Healthy', 'Hypertension-Safe',
  // Macros & Protein
  'High-Protein', 'Muscle-Building', 'Low-Fat', 'Energy-Dense', 'Weight-Loss',
  // Micronutrient focus
  'Iron-Rich', 'Calcium-Rich', 'Omega-3-Rich', 'Vitamin-D-Rich', 'B12-Rich',
  'Zinc-Rich', 'Magnesium-Rich', 'Folate-Rich', 'Selenium-Rich',
  // Digestive & Gut
  'High-Fiber', 'Low-GI', 'Gut-Health', 'Probiotic', 'Low-Sodium',
  // Anti-inflammatory & immunity
  'Anti-Inflammatory', 'Immune-Boost', 'Brain-Health', 'Bone-Health',
  // Lifestyle & culture
  'Low-Cholesterol', 'Detox', 'Sattvic', 'Traditional', 'Festival',
]
const PREP_OPTIONS  = [
  { label: 'Under 15 mins', value: 15 },
  { label: 'Under 30 mins', value: 30 },
  { label: 'Under 60 mins', value: 60 },
  { label: 'Any',           value: null },
]
const SEASONS       = ['Summer', 'Monsoon', 'Winter', 'All Year']
const SORT_OPTIONS  = [
  { label: 'Health Score', value: 'health_score' },
  { label: 'Calories ↑',   value: 'calories_asc' },
  { label: 'Prep Time',    value: 'prep_time' },
  { label: 'Rating',       value: 'rating' },
]

const FOOD_CATEGORIES = [
  { id: 'all',        label: 'All Foods',      icon: 'grid_view' },
  { id: 'dish',       label: 'Dishes',         icon: 'restaurant' },
  { id: 'fruit',      label: 'Fruits',         icon: 'nutrition' },
  { id: 'vegetable',  label: 'Vegetables',     icon: 'eco' },
  { id: 'grain',      label: 'Grains',         icon: 'grain' },
  { id: 'millet',     label: 'Millets',        icon: 'grass' },
  { id: 'legume',     label: 'Legumes',        icon: 'spa' },
  { id: 'nut_seed',   label: 'Nuts & Seeds',   icon: 'grain' },
  { id: 'spice',      label: 'Spices & Herbs', icon: 'local_fire_department' },
  { id: 'dairy',      label: 'Dairy',          icon: 'local_drink' },
  { id: 'sweet',      label: 'Sweets',         icon: 'cake' },
  { id: 'snack',      label: 'Snacks',         icon: 'fastfood' },
  { id: 'beverage',   label: 'Beverages',      icon: 'local_cafe' },
  { id: 'meat',       label: 'Meat',           icon: 'set_meal' },
  { id: 'seafood',    label: 'Fish & Seafood', icon: 'set_meal' },
  { id: 'egg',        label: 'Eggs',           icon: 'egg' },
  { id: 'oil',        label: 'Oils & Fats',    icon: 'water_drop' },
  { id: 'fermented',  label: 'Fermented',      icon: 'science' },
  { id: 'herb',       label: 'Herbs',          icon: 'forest' },
]

const ITEMS_PER_PAGE = 24

// Region value mapping: display label → data field value
const REGION_MAP = {
  'South Indian':  'south',
  'North Indian':  'north',
  'East Indian':   'east',
  'West Indian':   'west',
  'Northeast':     'northeast',
}

// Diet type value mapping
const DIET_MAP = {
  'Vegetarian':     'vegetarian',
  'Vegan':          'vegan',
  'Jain':           'jain',
  'Non-Vegetarian': 'non-vegetarian',
  'Eggetarian':     'eggetarian',
  'Sattvic':        'sattvic',
}

// ─── Diet Badge ───────────────────────────────────────────────────────────────

function DietBadge({ dietTypes = [] }) {
  if (!dietTypes.length) return null
  const primary = dietTypes[0]
  if (primary === 'vegan')
    return (
      <span className="flex items-center gap-0.5 bg-emerald-700/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none backdrop-blur-sm">
        🌱 Vegan
      </span>
    )
  if (primary === 'vegetarian')
    return (
      <span className="flex items-center gap-0.5 bg-green-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none backdrop-blur-sm">
        🟢 Veg
      </span>
    )
  return (
    <span className="flex items-center gap-0.5 bg-red-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none backdrop-blur-sm">
      🔴 Non-Veg
    </span>
  )
}

// ─── Health Score Pill ────────────────────────────────────────────────────────

function HealthScorePill({ score }) {
  const colorClass =
    score >= 80 ? 'bg-primary/10 text-primary border-primary/20'
    : score >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-red-100 text-red-600 border-red-200'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
      <span className="material-symbols-outlined text-[12px]">favorite</span>
      {score}
    </span>
  )
}

// ─── Rating Stars ─────────────────────────────────────────────────────────────

function RatingStars({ rating, reviews }) {
  const full  = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < full ? 'text-amber-400'
              : i === full && hasHalf ? 'text-amber-300'
              : 'text-surface-container-high'
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-on-surface-variant">({reviews?.toLocaleString()})</span>
    </div>
  )
}

// ─── Recipe Card ──────────────────────────────────────────────────────────────

function RecipeCard({ recipe, savedRecipes, onToggleSave, onAddToPlan }) {
  const navigate   = useNavigate()
  const isSaved    = savedRecipes.includes(recipe.id)
  const [imgError, setImgError] = useState(false)
  const { imageUrl, isLoading: imgLoading } = useFoodImage(recipe)

  const gradient = CATEGORY_GRADIENTS[recipe.category] || 'from-surface-container to-surface-container-high'
  const tagColors = ['bg-primary/10 text-primary', 'bg-secondary/10 text-secondary']
  const displayImg = !imgError && imageUrl

  return (
    <article
      className="group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-high
                 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-surface-container">
        {/* Loading skeleton */}
        {imgLoading && !displayImg && (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} animate-pulse`} />
        )}

        {/* Actual image */}
        {displayImg && (
          <img
            src={imageUrl}
            alt={recipe.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        {/* Emoji fallback (shown when no image and not loading) */}
        {!displayImg && !imgLoading && (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient} gap-2`}>
            {recipe.food_emoji
              ? <span className="text-5xl">{recipe.food_emoji}</span>
              : <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">restaurant</span>
            }
            {recipe.category && (
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">{recipe.category}</span>
            )}
          </div>
        )}

        {/* Overlays row */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
          {/* Diet badge */}
          <DietBadge dietTypes={recipe.diet_type} />

          <div className="flex flex-col items-end gap-1">
            {/* Recommended ribbon */}
            {recipe.health_score > 85 && (
              <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                ✦ Recommended
              </span>
            )}

            {/* Bookmark */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(recipe.id) }}
              className={`p-1.5 rounded-full backdrop-blur-sm shadow transition-colors
                ${isSaved
                  ? 'bg-primary text-on-primary'
                  : 'bg-black/30 text-white hover:bg-primary hover:text-on-primary'}`}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark recipe'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSaved ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col gap-2">
        {/* Name + regional */}
        <div>
          <h3 className="font-bold text-sm text-on-surface leading-snug line-clamp-1">{recipe.name}</h3>
          {recipe.name_regional && (
            <p className="text-xs text-on-surface-variant font-body mt-0.5">{recipe.name_regional}</p>
          )}
        </div>

        {/* Time + Calories */}
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          {recipe.prep_time_mins != null && recipe.prep_time_mins > 0 ? (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {recipe.prep_time_mins >= 60
                ? `${Math.round(recipe.prep_time_mins / 60)}h ${recipe.prep_time_mins % 60 > 0 ? `${recipe.prep_time_mins % 60}m` : ''}`
                : `${recipe.prep_time_mins}m`}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">straighten</span>
              per 100g
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            {recipe.nutrition?.calories ?? '—'} kcal
          </span>
        </div>

        {/* Health Tags */}
        {recipe.health_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.health_tags.slice(0, 2).map((tag, i) => (
              <span
                key={tag}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tagColors[i % 2]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <RatingStars rating={recipe.rating} reviews={recipe.reviews} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-container-high mt-auto">
          <HealthScorePill score={recipe.health_score} />
          <button
            onClick={(e) => { e.stopPropagation(); onAddToPlan(recipe) }}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-secondary hover:text-secondary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">calendar_add_on</span>
            Add to Plan
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── Filter Section (Collapsible) ─────────────────────────────────────────────

function FilterSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-surface-container-high last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-on-surface hover:text-primary transition-colors"
      >
        {title}
        <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

// ─── Checkbox Group ───────────────────────────────────────────────────────────

function CheckboxGroup({ options, selected, onChange }) {
  const toggle = (val) =>
    onChange(
      selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    )
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const checked = selected.includes(opt)
        return (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group/chk">
            <span
              className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] transition-colors
                ${checked ? 'bg-primary border-primary text-on-primary' : 'border-outline bg-surface-container-lowest group-hover/chk:border-primary'}`}
              onClick={() => toggle(opt)}
            >
              {checked && '✓'}
            </span>
            <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(opt)} />
            <span className="text-sm text-on-surface-variant select-none">{opt}</span>
          </label>
        )
      })}
    </div>
  )
}

// ─── Radio Group ─────────────────────────────────────────────────────────────

function RadioGroup({ options, selected, onChange, valueKey = 'value', labelKey = 'label' }) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt[valueKey] : opt
        const lbl = typeof opt === 'object' ? opt[labelKey] : opt
        const checked = selected === val
        return (
          <label key={lbl} className="flex items-center gap-2 cursor-pointer group/rad">
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                ${checked ? 'border-primary' : 'border-outline group-hover/rad:border-primary'}`}
              onClick={() => onChange(val)}
            >
              {checked && <span className="w-2 h-2 rounded-full bg-primary block" />}
            </span>
            <input type="radio" className="sr-only" checked={checked} onChange={() => onChange(val)} />
            <span className="text-sm text-on-surface-variant select-none">{lbl}</span>
          </label>
        )
      })}
    </div>
  )
}

// ─── Season Pills ─────────────────────────────────────────────────────────────

function SeasonPills({ options, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected === opt
        return (
          <button
            key={opt}
            onClick={() => onChange(active ? null : opt)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors
              ${active
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-lowest border-surface-container-high text-on-surface-variant hover:border-primary hover:text-primary'}`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecipesPage() {
  const navigate    = useNavigate()
  const { savedRecipes, toggleSave } = useRecipeStore()
  const { profile }                  = useProfileStore()

  // ── External recipes from TheMealDB ─────────────────────────────────────
  const { data: externalRecipes = [], isLoading: isLoadingExternal } = useQuery({
    queryKey: ['indianRecipesExpanded'],
    queryFn:  () => fetchMoreIndianRecipes(5),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })

  // Merge mock + external + individual foods — de-duplicate by name
  const allRecipes = useMemo(() => {
    const mockNames = new Set(mockRecipes.map((r) => r.name.toLowerCase()))
    const uniqueExternal = externalRecipes.filter((r) => !mockNames.has(r.name.toLowerCase()))
    const allNames = new Set([...mockNames, ...uniqueExternal.map((r) => r.name.toLowerCase())])
    const uniqueFoods = (foodsDb || []).filter((f) => !allNames.has(f.name.toLowerCase()))
    return [...mockRecipes, ...uniqueExternal, ...uniqueFoods]
  }, [externalRecipes])

  // ── Local filter state ───────────────────────────────────────────────────
  const [foodCategory, setFoodCategory] = useState('all')
  const [mealTypes,   setMealTypes]   = useState([])
  const [dietTypes,   setDietTypes]   = useState([])
  const [regions,     setRegions]     = useState([])
  const [healthTags,  setHealthTags]  = useState([])
  const [calMin,      setCalMin]      = useState('')
  const [calMax,      setCalMax]      = useState('')
  const [prepTime,    setPrepTime]    = useState(null)
  const [season,      setSeason]      = useState(null)
  const [sortBy,      setSortBy]      = useState('health_score')

  // ── Add to Plan modal ────────────────────────────────────────────────────
  const [addToPlanItem, setAddToPlanItem] = useState(null)

  // ── Infinite scroll ──────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => c + ITEMS_PER_PAGE)
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ── Search with debounce ─────────────────────────────────────────────────
  const [searchInput,  setSearchInput]  = useState('')
  const [searchQuery,  setSearchQuery]  = useState('')
  const debounceRef = useRef(null)

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value
    setSearchInput(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchQuery(val), 300)
  }, [])

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // ── Open Food Facts live search (declared after searchQuery) ─────────────
  const [offPage,    setOffPage]    = useState(1)
  const [offItems,   setOffItems]   = useState([])
  const [offLoading, setOffLoading] = useState(false)
  const [offHasMore, setOffHasMore] = useState(false)
  const offQueryRef = useRef('')

  // ── USDA live search ─────────────────────────────────────────────────────
  const [usdaItems,   setUsdaItems]   = useState([])
  const [usdaLoading, setUsdaLoading] = useState(false)
  const [usdaHasMore, setUsdaHasMore] = useState(false)
  const [usdaPage,    setUsdaPage]    = useState(1)

  const loadUSDAResults = useCallback(async (query, page = 1) => {
    if (!query || query.trim().length < 2) {
      setUsdaItems([])
      setUsdaHasMore(false)
      return
    }
    setUsdaLoading(true)
    try {
      const { items, hasMore } = await searchUSDA(query, page, 25)
      setUsdaItems((prev) => page === 1 ? items : [...prev, ...items])
      setUsdaHasMore(hasMore)
      setUsdaPage(page)
    } finally {
      setUsdaLoading(false)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setUsdaItems([])
      setUsdaPage(1)
      loadUSDAResults(searchQuery, 1)
    } else {
      setUsdaItems([])
      setUsdaHasMore(false)
    }
  }, [searchQuery, loadUSDAResults])

  const [offFallbackTerm, setOffFallbackTerm] = useState(null)

  const loadOFFResults = useCallback(async (query, page = 1) => {
    if (!query || query.trim().length < 2) {
      setOffItems([])
      setOffHasMore(false)
      setOffFallbackTerm(null)
      return
    }
    setOffLoading(true)
    try {
      const result = await searchOFFWithFallback(query, page, 24)
      setOffItems((prev) => page === 1 ? result.items : [...prev, ...result.items])
      setOffHasMore(result.hasMore)
      setOffPage(page)
      setOffFallbackTerm(result.isFallback ? result.fallbackTerm : null)
    } finally {
      setOffLoading(false)
    }
  }, [])

  // Trigger OFF search when searchQuery changes (min 2 chars)
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      offQueryRef.current = searchQuery
      setOffItems([])
      setOffPage(1)
      loadOFFResults(searchQuery, 1)
    } else {
      setOffItems([])
      setOffHasMore(false)
      setOffFallbackTerm(null)
    }
  }, [searchQuery, loadOFFResults])

  // ── Active filter count ──────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (mealTypes.length)  count += mealTypes.length
    if (dietTypes.length)  count += dietTypes.length
    if (regions.length)    count += regions.length
    if (healthTags.length) count += healthTags.length
    if (calMin !== '')     count++
    if (calMax !== '')     count++
    if (prepTime !== null) count++
    if (season !== null)   count++
    if (sortBy !== 'health_score') count++
    return count
  }, [mealTypes, dietTypes, regions, healthTags, calMin, calMax, prepTime, season, sortBy])

  const clearAll = useCallback(() => {
    setFoodCategory('all')
    setMealTypes([])
    setDietTypes([])
    setRegions([])
    setHealthTags([])
    setCalMin('')
    setCalMax('')
    setPrepTime(null)
    setSeason(null)
    setSortBy('health_score')
    setSearchInput('')
    setSearchQuery('')
    setVisibleCount(ITEMS_PER_PAGE)
  }, [])

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE) }, [foodCategory, searchQuery, mealTypes, dietTypes, regions, healthTags, calMin, calMax, prepTime, season, sortBy])

  // ── Filtered + sorted recipes ────────────────────────────────────────────
  const filteredRecipes = useMemo(() => {
    let results = [...allRecipes]

    // Food category filter
    if (foodCategory !== 'all') {
      if (foodCategory === 'dish') {
        // Include: mockRecipes + externalRecipes (source !== food_item) AND foodsDb dish-category items
        results = results.filter((r) => r.source !== 'food_item' || r.category === 'dish')
      } else {
        results = results.filter((r) => r.category === foodCategory)
      }
    }

    // Search — normalized: handles aliases, regional names, joined words
    if (searchQuery.trim()) {
      const terms = expandSearchTerms(searchQuery)
      results = results.filter((r) => foodMatchesQuery(r, terms))
    }

    // Meal type
    if (mealTypes.length) {
      const vals = mealTypes.map((m) => m.toLowerCase())
      results = results.filter((r) => {
        const mt = r.meal_type
        if (!mt) return false
        if (Array.isArray(mt)) return mt.some((m) => vals.includes(m.toLowerCase()))
        return vals.includes(mt.toLowerCase())
      })
    }

    // Diet type
    if (dietTypes.length) {
      const vals = dietTypes.map((d) => DIET_MAP[d] || d.toLowerCase())
      results = results.filter((r) =>
        r.diet_type?.some((dt) => vals.includes(dt.toLowerCase()))
      )
    }

    // Region
    if (regions.length) {
      const vals = regions.map((r) => REGION_MAP[r] || r.toLowerCase())
      results = results.filter((r) => vals.includes(r.region?.toLowerCase()))
    }

    // Health tags (fuzzy — tag in recipe contains filter tag word)
    if (healthTags.length) {
      results = results.filter((r) =>
        healthTags.some((ft) =>
          r.health_tags?.some((rt) =>
            rt.toLowerCase().replace(/[-\s]/g, '').includes(
              ft.toLowerCase().replace(/[-\s]/g, '')
            )
          )
        )
      )
    }

    // Calorie range
    const minCal = calMin !== '' ? Number(calMin) : null
    const maxCal = calMax !== '' ? Number(calMax) : null
    if (minCal !== null) results = results.filter((r) => (r.nutrition?.calories ?? 0) >= minCal)
    if (maxCal !== null) results = results.filter((r) => (r.nutrition?.calories ?? 0) <= maxCal)

    // Prep time
    if (prepTime !== null) {
      results = results.filter((r) => (r.prep_time_mins ?? 0) <= prepTime)
    }

    // Season
    if (season) {
      const seasonVal = season.toLowerCase().replace(/\s+/g, '-')
      results = results.filter((r) =>
        r.season_tags?.some((s) =>
          s.toLowerCase() === seasonVal || s.toLowerCase() === 'all-year'
        )
      )
    }

    // Sort
    switch (sortBy) {
      case 'health_score':
        results.sort((a, b) => (b.health_score ?? 0) - (a.health_score ?? 0))
        break
      case 'calories_asc':
        results.sort((a, b) => (a.nutrition?.calories ?? 0) - (b.nutrition?.calories ?? 0))
        break
      case 'prep_time':
        results.sort((a, b) => (a.prep_time_mins ?? 0) - (b.prep_time_mins ?? 0))
        break
      case 'rating':
        results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      default:
        break
    }

    return results
  }, [allRecipes, foodCategory, searchQuery, mealTypes, dietTypes, regions, healthTags, calMin, calMax, prepTime, season, sortBy])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-surface-container-lowest border-b border-surface-container-high px-8 py-6">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="font-headline text-3xl font-black text-primary">Food Discovery</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Explore Indian dishes, fruits, vegetables, nuts, seeds, legumes and fermented foods
          </p>
          {/* Food Category Bar */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFoodCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
                  foodCategory === cat.id
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-on-surface-variant border-surface-container-high hover:border-primary hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>{cat.icon}</span>
                {cat.label}
                {cat.id !== 'all' && cat.id !== 'dish' && foodsDb.filter((f) => f.category === cat.id).length > 0 && (
                  <span className={`text-[10px] px-1 rounded-full ${foodCategory === cat.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    {foodsDb.filter((f) => f.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 items-start">

        {/* ── LEFT FILTER SIDEBAR ─────────────────────────────────────────── */}
        <aside className="w-72 min-h-screen flex-shrink-0 sticky top-8">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4 shadow-sm">

            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <h2 className="font-headline font-bold text-on-surface text-base">Refine Results</h2>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-on-primary text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Meal Type */}
            <FilterSection title="Meal Type">
              <CheckboxGroup options={MEAL_TYPES} selected={mealTypes} onChange={setMealTypes} />
            </FilterSection>

            {/* Diet Type */}
            <FilterSection title="Diet Type">
              <CheckboxGroup options={DIET_TYPES} selected={dietTypes} onChange={setDietTypes} />
            </FilterSection>

            {/* Region */}
            <FilterSection title="Region">
              <CheckboxGroup options={REGIONS} selected={regions} onChange={setRegions} />
            </FilterSection>

            {/* Health Tags */}
            <FilterSection title="Health Tags" defaultOpen={false}>
              <CheckboxGroup options={HEALTH_TAGS} selected={healthTags} onChange={setHealthTags} />
            </FilterSection>

            {/* Calorie Range */}
            <FilterSection title="Calorie Range" defaultOpen={false}>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={calMin}
                    onChange={(e) => setCalMin(e.target.value)}
                    className="w-full text-sm border border-surface-container-high rounded-lg px-2.5 py-1.5 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-0.5 text-center">kcal</p>
                </div>
                <span className="text-on-surface-variant text-xs mb-4">–</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={calMax}
                    onChange={(e) => setCalMax(e.target.value)}
                    className="w-full text-sm border border-surface-container-high rounded-lg px-2.5 py-1.5 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-0.5 text-center">kcal</p>
                </div>
              </div>
            </FilterSection>

            {/* Prep Time */}
            <FilterSection title="Prep Time" defaultOpen={false}>
              <RadioGroup
                options={PREP_OPTIONS}
                selected={prepTime}
                onChange={setPrepTime}
              />
            </FilterSection>

            {/* Season */}
            <FilterSection title="Season" defaultOpen={false}>
              <SeasonPills options={SEASONS} selected={season} onChange={setSeason} />
            </FilterSection>

            {/* Sort By */}
            <FilterSection title="Sort By" defaultOpen={false}>
              <RadioGroup
                options={SORT_OPTIONS}
                selected={sortBy}
                onChange={setSortBy}
              />
            </FilterSection>
          </div>
        </aside>

        {/* ── RIGHT RECIPE GRID ────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-on-surface-variant">
              Showing{' '}
              <span className="font-semibold text-on-surface">{Math.min(visibleCount, filteredRecipes.length)}</span>
              {' of '}
              <span className="font-semibold text-on-surface">{filteredRecipes.length}</span>{' '}
              {foodCategory === 'dish' ? 'dishes' : foodCategory === 'all' ? 'foods' : foodCategory + 's'}
              {allRecipes.length > mockRecipes.length && (
                <span className="text-primary font-medium"> · {allRecipes.length} total in library</span>
              )}
            </p>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search recipes…"
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-9 pr-4 py-2 text-sm rounded-xl border border-surface-container-high bg-surface-container-lowest text-on-surface
                             focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-56 transition-all"
                />
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-surface-container-high rounded-xl px-3 py-2 bg-surface-container-lowest
                             text-on-surface appearance-none pr-8 focus:outline-none focus:border-primary cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {mealTypes.map((t) => (
                <FilterChip key={t} label={t} onRemove={() => setMealTypes((v) => v.filter((x) => x !== t))} />
              ))}
              {dietTypes.map((t) => (
                <FilterChip key={t} label={t} onRemove={() => setDietTypes((v) => v.filter((x) => x !== t))} />
              ))}
              {regions.map((t) => (
                <FilterChip key={t} label={t} onRemove={() => setRegions((v) => v.filter((x) => x !== t))} />
              ))}
              {healthTags.map((t) => (
                <FilterChip key={t} label={t} onRemove={() => setHealthTags((v) => v.filter((x) => x !== t))} />
              ))}
              {calMin !== '' && (
                <FilterChip label={`Min ${calMin} kcal`} onRemove={() => setCalMin('')} />
              )}
              {calMax !== '' && (
                <FilterChip label={`Max ${calMax} kcal`} onRemove={() => setCalMax('')} />
              )}
              {prepTime !== null && (
                <FilterChip
                  label={PREP_OPTIONS.find((p) => p.value === prepTime)?.label ?? ''}
                  onRemove={() => setPrepTime(null)}
                />
              )}
              {season && <FilterChip label={season} onRemove={() => setSeason(null)} />}
            </div>
          )}

          {/* External recipes loading indicator */}
          {isLoadingExternal && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 px-1">
              <span className="material-symbols-outlined text-primary text-base animate-spin">refresh</span>
              Fetching more Indian recipes from TheMealDB…
            </div>
          )}

          {/* Grid */}
          {filteredRecipes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.slice(0, visibleCount).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    savedRecipes={savedRecipes}
                    onToggleSave={toggleSave}
                    onAddToPlan={setAddToPlanItem}
                  />
                ))}
              </div>
              {/* Load more sentinel */}
              {visibleCount < filteredRecipes.length && (
                <div ref={sentinelRef} className="flex items-center justify-center gap-3 py-10 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-primary">refresh</span>
                  Loading more…
                </div>
              )}
              {visibleCount >= filteredRecipes.length && filteredRecipes.length > ITEMS_PER_PAGE && (
                <p className="text-center text-xs text-on-surface-variant py-8">
                  All {filteredRecipes.length} results shown
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
                search_off
              </span>
              <p className="text-on-surface-variant font-medium text-lg">No foods found</p>
              <p className="text-sm text-on-surface-variant/70">Try adjusting your filters or search terms</p>
              <button
                onClick={clearAll}
                className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* ── Open Food Facts live results (when searching) ── */}
          {searchQuery.trim().length >= 2 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-[14px]">public</span>
                </div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  More results from Open Food Facts
                  {offFallbackTerm && (
                    <span className="ml-2 text-xs text-amber-600 font-normal">
                      (showing results for "{offFallbackTerm}")
                    </span>
                  )}
                  {offLoading && <span className="ml-2 text-xs text-gray-400 font-normal">Loading…</span>}
                </h3>
                <span className="text-xs text-gray-400 ml-auto">{offItems.length} found</span>
              </div>
              {offItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {offItems.map((item) => (
                    <RecipeCard
                      key={item.id}
                      recipe={item}
                      savedRecipes={savedRecipes}
                      onToggleSave={toggleSave}
                      onAddToPlan={setAddToPlanItem}
                    />
                  ))}
                </div>
              )}
              {offHasMore && !offLoading && (
                <button
                  onClick={() => loadOFFResults(searchQuery, offPage + 1)}
                  className="mt-4 w-full py-3 rounded-2xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
                >
                  Load more from Open Food Facts
                </button>
              )}
              {!offLoading && offItems.length === 0 && !usdaItems.length && (
                <p className="text-sm text-gray-400 text-center py-6">No results from Open Food Facts</p>
              )}
            </div>
          )}

          {/* ── USDA FoodData Central live results ── */}
          {searchQuery.trim().length >= 2 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600 text-[14px]">science</span>
                </div>
                <h3 className="font-semibold text-gray-700 text-sm">
                  USDA FoodData Central
                  {usdaLoading && <span className="ml-2 text-xs text-gray-400 font-normal">Loading…</span>}
                </h3>
                <span className="text-xs text-gray-400 ml-auto">{usdaItems.length} found</span>
              </div>
              {usdaItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {usdaItems.map((item) => (
                    <RecipeCard
                      key={item.id}
                      recipe={item}
                      savedRecipes={savedRecipes}
                      onToggleSave={toggleSave}
                      onAddToPlan={setAddToPlanItem}
                    />
                  ))}
                </div>
              )}
              {usdaHasMore && !usdaLoading && (
                <button
                  onClick={() => loadUSDAResults(searchQuery, usdaPage + 1)}
                  className="mt-4 w-full py-3 rounded-2xl border border-amber-200 text-amber-700 text-sm font-semibold hover:bg-amber-50 transition-colors"
                >
                  Load more from USDA
                </button>
              )}
              {!usdaLoading && usdaItems.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No USDA results found</p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add to Plan modal */}
      {addToPlanItem && (
        <AddToPlanModal item={addToPlanItem} onClose={() => setAddToPlanItem(null)} />
      )}
    </div>
  )
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
      {label}
      <button onClick={onRemove} className="hover:text-primary/60 transition-colors" aria-label={`Remove ${label} filter`}>
        <span className="material-symbols-outlined text-[13px] leading-none">close</span>
      </button>
    </span>
  )
}
