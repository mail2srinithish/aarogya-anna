import { useState, useMemo } from 'react'
import AddToPlanModal from '../components/common/AddToPlanModal'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUPPLEMENT_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'protein', label: 'Protein', icon: 'fitness_center' },
  { id: 'creatine', label: 'Creatine', icon: 'bolt' },
  { id: 'preworkout', label: 'Pre-Workout', icon: 'rocket_launch' },
  { id: 'omega3', label: 'Omega-3', icon: 'waves' },
  { id: 'vitamins', label: 'Vitamins', icon: 'vaccines' },
  { id: 'bcaa', label: 'BCAAs', icon: 'recycling' },
  { id: 'gainer', label: 'Weight Gainer', icon: 'scale' },
  { id: 'ayurvedic', label: 'Ayurvedic', icon: 'spa' },
]

const SUPPLEMENTS = [
  // ── Protein ──────────────────────────────────────────────────────────────
  {
    id: 'on-gold-standard',
    name: 'Gold Standard 100% Whey',
    brand: 'Optimum Nutrition',
    category: 'protein',
    flavor: ['Double Rich Chocolate', 'Vanilla Ice Cream', 'Strawberry', 'Cookies & Cream'],
    rating: 4.8,
    price_inr: 3999,
    size_g: 907,
    servings: 29,
    serving_size_g: 31,
    emoji: '🥛',
    nutrition_per_serving: {
      calories: 120, protein_g: 24, carbs_g: 3, fat_g: 1, sugar_g: 1,
    },
    science_note: 'Blend of whey isolate, concentrate, and peptides. Leucine content triggers mTORC1 pathway for muscle protein synthesis.',
    best_time: 'Post-workout within 30 min',
    tags: ['Muscle Gain', 'Recovery', 'Low Carb'],
    suitable_for: ['gym', 'general'],
    color: '#8b5cf6',
    bg: '#ede9fe',
  },
  {
    id: 'myprotein-impact',
    name: 'Impact Whey Protein',
    brand: 'MyProtein',
    category: 'protein',
    flavor: ['Unflavoured', 'Chocolate', 'Vanilla', 'Strawberry Cream', 'Salted Caramel'],
    rating: 4.6,
    price_inr: 2199,
    size_g: 1000,
    servings: 40,
    serving_size_g: 25,
    emoji: '🥛',
    nutrition_per_serving: {
      calories: 103, protein_g: 21, carbs_g: 1, fat_g: 1.9, sugar_g: 0.8,
    },
    science_note: 'High BCAA profile (5.5g leucine+isoleucine+valine per serving). Cost-effective with 84% protein by weight.',
    best_time: 'Post-workout or between meals',
    tags: ['Value for Money', 'High BCAA', 'Lean Muscle'],
    suitable_for: ['gym', 'general'],
    color: '#8b5cf6',
    bg: '#ede9fe',
  },
  {
    id: 'muscleblaze-biozyme',
    name: 'Biozyme Whey Performance',
    brand: 'MuscleBlaze',
    category: 'protein',
    flavor: ['Rich Chocolate', 'Cookies & Cream', 'Irish Coffee'],
    rating: 4.5,
    price_inr: 1999,
    size_g: 1000,
    servings: 34,
    serving_size_g: 29,
    emoji: '🥛',
    nutrition_per_serving: {
      calories: 116, protein_g: 25, carbs_g: 2.5, fat_g: 1.6, sugar_g: 0.5,
    },
    science_note: 'Engineered absorption formula (EAF®) with protease enzymes — 50% better protein absorption vs. standard whey in Indian gut conditions.',
    best_time: 'Post-workout, 30–45 min window',
    tags: ['Indian Brand', 'Enhanced Absorption', 'High Protein'],
    suitable_for: ['gym', 'general'],
    color: '#8b5cf6',
    bg: '#ede9fe',
  },
  {
    id: 'dymatize-iso100',
    name: 'ISO100 Hydrolyzed',
    brand: 'Dymatize',
    category: 'protein',
    flavor: ['Gourmet Chocolate', 'Strawberry', 'Fudge Brownie', 'Peanut Butter'],
    rating: 4.7,
    price_inr: 5499,
    size_g: 726,
    servings: 25,
    serving_size_g: 29,
    emoji: '🥛',
    nutrition_per_serving: {
      calories: 110, protein_g: 25, carbs_g: 0, fat_g: 0.5, sugar_g: 0,
    },
    science_note: 'Hydrolyzed whey isolate — pre-digested for fastest absorption (~15 min gastric emptying). Zero carbs, zero fat. Ideal for fat loss phases.',
    best_time: 'Immediately post-workout',
    tags: ['Zero Carb', 'Fastest Absorption', 'Fat Loss Friendly'],
    suitable_for: ['gym'],
    color: '#8b5cf6',
    bg: '#ede9fe',
  },
  {
    id: 'sattu-protein',
    name: 'Roasted Chana Sattu',
    brand: 'Organic India',
    category: 'protein',
    flavor: ['Natural', 'Masala'],
    rating: 4.3,
    price_inr: 299,
    size_g: 500,
    servings: 20,
    serving_size_g: 25,
    emoji: '🫘',
    nutrition_per_serving: {
      calories: 98, protein_g: 9, carbs_g: 14, fat_g: 1.5, fiber_g: 4,
    },
    science_note: 'Ancient Indian complete protein with iron (1.8mg/serving), magnesium, and prebiotic fiber. Slow-digesting, ideal for satiety.',
    best_time: 'Morning drink or between meals',
    tags: ['Ayurvedic', 'Vegan', 'Budget Friendly', 'Iron-Rich'],
    suitable_for: ['general', 'gym'],
    color: '#8b5cf6',
    bg: '#ede9fe',
  },

  // ── Creatine ────────────────────────────────────────────────────────────────
  {
    id: 'on-creatine',
    name: 'Micronized Creatine Powder',
    brand: 'Optimum Nutrition',
    category: 'creatine',
    flavor: ['Unflavoured'],
    rating: 4.7,
    price_inr: 1299,
    size_g: 317,
    servings: 60,
    serving_size_g: 5,
    emoji: '⚡',
    nutrition_per_serving: {
      calories: 0, protein_g: 0, carbs_g: 0, creatine_g: 5,
    },
    science_note: 'Creatine monohydrate — most researched sports supplement. Saturates phosphocreatine stores, producing 3–15% more ATP during explosive efforts.',
    best_time: 'Post-workout with carbs, or any time consistently',
    tags: ['Strength', 'Power', 'Most Researched'],
    suitable_for: ['gym'],
    color: '#f59e0b',
    bg: '#fef3c7',
  },
  {
    id: 'bigmuscles-creatine',
    name: 'Creatine Monohydrate',
    brand: 'Big Muscles',
    category: 'creatine',
    flavor: ['Unflavoured'],
    rating: 4.4,
    price_inr: 799,
    size_g: 300,
    servings: 60,
    serving_size_g: 5,
    emoji: '⚡',
    nutrition_per_serving: {
      calories: 0, protein_g: 0, carbs_g: 0, creatine_g: 5,
    },
    science_note: 'Pure pharmaceutical-grade creatine monohydrate. Loading phase (20g/day × 5 days) increases muscle creatine stores by 20–30%.',
    best_time: 'Post-workout, mix with warm water',
    tags: ['Budget', 'Pure', 'Strength'],
    suitable_for: ['gym'],
    color: '#f59e0b',
    bg: '#fef3c7',
  },

  // ── Pre-Workout ─────────────────────────────────────────────────────────────
  {
    id: 'on-preworkout',
    name: 'Gold Standard Pre-Workout',
    brand: 'Optimum Nutrition',
    category: 'preworkout',
    flavor: ['Blueberry Lemonade', 'Watermelon', 'Green Apple'],
    rating: 4.5,
    price_inr: 2499,
    size_g: 330,
    servings: 30,
    serving_size_g: 11,
    emoji: '🚀',
    nutrition_per_serving: {
      calories: 35, caffeine_mg: 175, beta_alanine_g: 1.5, creatine_g: 1,
    },
    science_note: 'Caffeine (175mg) + β-alanine (1.5g) + L-Citrulline (750mg). Caffeine reduces RPE; citrulline increases NO for pump; β-alanine delays lactic acid.',
    best_time: '20–30 min before training',
    tags: ['Energy', 'Focus', 'Pump'],
    suitable_for: ['gym'],
    color: '#ef4444',
    bg: '#fee2e2',
  },
  {
    id: 'hyde-preworkout',
    name: 'Mr. Hyde Nitro X',
    brand: 'ProSupps',
    category: 'preworkout',
    flavor: ['Blue Razz', 'Pixie Dust', 'Watermelon'],
    rating: 4.3,
    price_inr: 2999,
    size_g: 294,
    servings: 30,
    serving_size_g: 9.8,
    emoji: '🚀',
    nutrition_per_serving: {
      calories: 15, caffeine_mg: 400, beta_alanine_g: 2.5, nitrosigine_mg: 1500,
    },
    science_note: 'Very high caffeine (400mg) — not for beginners. Nitrosigine (bonded arginine silicate) shows superior pump vs. standard arginine at 1500mg.',
    best_time: '30 min before training. Half dose for first use.',
    tags: ['High Stimulant', 'Advanced', 'Pump'],
    suitable_for: ['gym'],
    color: '#ef4444',
    bg: '#fee2e2',
  },

  // ── Omega-3 ─────────────────────────────────────────────────────────────────
  {
    id: 'healthkart-omega3',
    name: 'Omega-3 Fish Oil 1000mg',
    brand: 'HealthKart',
    category: 'omega3',
    flavor: ['Lemon'],
    rating: 4.4,
    price_inr: 699,
    size_g: null,
    servings: 60,
    serving_size_g: 1,
    emoji: '🐟',
    nutrition_per_serving: {
      calories: 9, epa_mg: 180, dha_mg: 120, omega3_total_mg: 300,
    },
    science_note: 'EPA reduces triglycerides and systemic inflammation (COX pathway). DHA is structural component of brain cell membranes and retina (essential for cognition).',
    best_time: 'With meals containing fat for better absorption',
    tags: ['Heart Health', 'Brain Health', 'Anti-Inflammatory'],
    suitable_for: ['general', 'gym', 'hypertension'],
    color: '#0ea5e9',
    bg: '#e0f2fe',
  },
  {
    id: 'now-omega3',
    name: 'Omega-3 2000mg',
    brand: 'NOW Foods',
    category: 'omega3',
    flavor: ['Unflavoured'],
    rating: 4.6,
    price_inr: 1299,
    size_g: null,
    servings: 100,
    serving_size_g: 2,
    emoji: '🐟',
    nutrition_per_serving: {
      calories: 18, epa_mg: 360, dha_mg: 240, omega3_total_mg: 600,
    },
    science_note: 'Higher EPA+DHA concentration (600mg/serving). Clinical dose for anti-inflammatory effect is 2–4g/day EPA+DHA. Enteric coated to prevent fish burps.',
    best_time: 'With largest meal of the day',
    tags: ['High Dose', 'NSF Certified', 'Heart Health'],
    suitable_for: ['general', 'gym', 'hypertension', 'pcod'],
    color: '#0ea5e9',
    bg: '#e0f2fe',
  },

  // ── Vitamins ────────────────────────────────────────────────────────────────
  {
    id: 'healthkart-vitd3',
    name: 'Vitamin D3 2000 IU',
    brand: 'HealthKart',
    category: 'vitamins',
    flavor: ['Unflavoured'],
    rating: 4.5,
    price_inr: 399,
    size_g: null,
    servings: 60,
    serving_size_g: 1,
    emoji: '☀️',
    nutrition_per_serving: {
      vitamin_d_iu: 2000, vitamin_d_mcg: 50,
    },
    science_note: 'Over 80% of Indians are Vitamin D deficient (NNMB survey). D3 (cholecalciferol) is 87% more potent than D2. Pair with K2 (MK-7) to direct calcium to bones.',
    best_time: 'Morning with fat-containing meal',
    tags: ['Bone Health', 'Immunity', 'Indian Essential'],
    suitable_for: ['general', 'thyroid', 'bone_health'],
    color: '#eab308',
    bg: '#fef9c3',
  },
  {
    id: 'naturyz-multivitamin',
    name: 'Men\'s Sport Multivitamin',
    brand: 'Naturyz',
    category: 'vitamins',
    flavor: ['Unflavoured'],
    rating: 4.3,
    price_inr: 799,
    size_g: null,
    servings: 60,
    serving_size_g: 1,
    emoji: '💊',
    nutrition_per_serving: {
      vitamin_a_mcg: 900, vitamin_c_mg: 90, vitamin_d_mcg: 25, vitamin_b12_mcg: 6, zinc_mg: 11,
    },
    science_note: '25+ vitamins and minerals. Methyl-folate (5-MTHF) form rather than folic acid — 7× better absorption for MTHFR gene variants common in South Asians.',
    best_time: 'With breakfast',
    tags: ['Complete', 'Sports Nutrition', 'Methylated B-Vitamins'],
    suitable_for: ['gym', 'general'],
    color: '#10b981',
    bg: '#d1fae5',
  },
  {
    id: 'himalayan-ashwagandha',
    name: 'Ashwagandha KSM-66',
    brand: 'Himalayan Organics',
    category: 'vitamins',
    flavor: ['Unflavoured'],
    rating: 4.6,
    price_inr: 699,
    size_g: null,
    servings: 60,
    serving_size_g: 1,
    emoji: '🌿',
    nutrition_per_serving: {
      ashwagandha_mg: 600, withanolides_pct: 5,
    },
    science_note: 'KSM-66 full-spectrum root extract (5% withanolides). RCTs show 27% reduction in cortisol, 15% increase in testosterone in men, and improved VO₂max.',
    best_time: 'With warm milk at night for best absorption',
    tags: ['Adaptogen', 'Stress Relief', 'Testosterone', 'Ayurvedic'],
    suitable_for: ['gym', 'general', 'pcod'],
    color: '#10b981',
    bg: '#d1fae5',
  },

  // ── BCAAs ───────────────────────────────────────────────────────────────────
  {
    id: 'on-bcaa',
    name: 'Instantized BCAA 5000 Powder',
    brand: 'Optimum Nutrition',
    category: 'bcaa',
    flavor: ['Fruit Punch', 'Orange', 'Unflavoured'],
    rating: 4.5,
    price_inr: 1999,
    size_g: 380,
    servings: 40,
    serving_size_g: 9.5,
    emoji: '💪',
    nutrition_per_serving: {
      calories: 20, leucine_g: 2.5, isoleucine_g: 1.25, valine_g: 1.25, total_bcaa_g: 5,
    },
    science_note: 'Leucine:Isoleucine:Valine ratio of 2:1:1 mirrors human muscle protein composition. Leucine acts as anabolic switch activating mTOR signaling.',
    best_time: 'During workout or immediately post',
    tags: ['Muscle Preservation', 'Recovery', 'Intra-Workout'],
    suitable_for: ['gym'],
    color: '#ec4899',
    bg: '#fce7f3',
  },
  {
    id: 'muscleblaze-bcaa',
    name: 'BCAA Gold 8:1:1',
    brand: 'MuscleBlaze',
    category: 'bcaa',
    flavor: ['Watermelon Rush', 'Fruit Blast'],
    rating: 4.3,
    price_inr: 1299,
    size_g: 250,
    servings: 30,
    serving_size_g: 8.3,
    emoji: '💪',
    nutrition_per_serving: {
      calories: 15, leucine_g: 4, isoleucine_g: 0.5, valine_g: 0.5, total_bcaa_g: 5,
    },
    science_note: '8:1:1 ratio provides extra leucine (4g) to maximally stimulate muscle protein synthesis. Some research supports higher leucine ratios for trained individuals.',
    best_time: 'Intra-workout or post-workout',
    tags: ['High Leucine', 'Anabolic', 'Indian Brand'],
    suitable_for: ['gym'],
    color: '#ec4899',
    bg: '#fce7f3',
  },

  // ── Weight Gainers ──────────────────────────────────────────────────────────
  {
    id: 'on-serious-mass',
    name: 'Serious Mass',
    brand: 'Optimum Nutrition',
    category: 'gainer',
    flavor: ['Chocolate', 'Vanilla', 'Banana'],
    rating: 4.4,
    price_inr: 4999,
    size_g: 2720,
    servings: 8,
    serving_size_g: 340,
    emoji: '🏋️',
    nutrition_per_serving: {
      calories: 1250, protein_g: 50, carbs_g: 252, fat_g: 4.5, fiber_g: 5,
    },
    science_note: 'High-calorie formula designed for a caloric surplus. Maltodextrin provides fast-absorbing carbohydrates for glycogen replenishment after training.',
    best_time: 'Post-workout or between meals for hard gainers',
    tags: ['Mass Gain', 'High Calorie', 'Hard Gainers'],
    suitable_for: ['gym'],
    color: '#6366f1',
    bg: '#e0e7ff',
  },
  {
    id: 'muscleblaze-super-gainer',
    name: 'Super Gainer XXL',
    brand: 'MuscleBlaze',
    category: 'gainer',
    flavor: ['Chocolate', 'Kesar Badam'],
    rating: 4.2,
    price_inr: 2499,
    size_g: 3000,
    servings: 25,
    serving_size_g: 120,
    emoji: '🏋️',
    nutrition_per_serving: {
      calories: 432, protein_g: 23, carbs_g: 80, fat_g: 2.4, fiber_g: 2,
    },
    science_note: 'Indian-formulated gainer with digestive enzymes (amylase, protease, lipase) to handle large carbohydrate load common in Indian diets.',
    best_time: 'Post-workout or as meal replacement',
    tags: ['Budget', 'Indian Brand', 'Digestive Enzymes'],
    suitable_for: ['gym'],
    color: '#6366f1',
    bg: '#e0e7ff',
  },

  // ── Ayurvedic ───────────────────────────────────────────────────────────────
  {
    id: 'dabur-chyawanprash',
    name: 'Dabur Chyawanprash',
    brand: 'Dabur',
    category: 'ayurvedic',
    flavor: ['Classic', 'Sugar-Free'],
    rating: 4.6,
    price_inr: 299,
    size_g: 500,
    servings: 100,
    serving_size_g: 5,
    emoji: '🪴',
    nutrition_per_serving: {
      calories: 20, vitamin_c_mg: 24, amla_mg: 500,
    },
    science_note: 'Amla (Indian gooseberry) provides 24mg Vitamin C per serving in the most bioavailable form. 47 Ayurvedic herbs with adaptogenic and immunomodulatory properties.',
    best_time: 'Morning, empty stomach or with warm milk',
    tags: ['Immunity', 'Vitamin C', 'Rasayana', 'Seasonal'],
    suitable_for: ['general', 'anemia', 'immunity'],
    color: '#84cc16',
    bg: '#f0fdf4',
  },
  {
    id: 'himalaya-shilajit',
    name: 'Pure Himalayan Shilajit',
    brand: 'Himalaya',
    category: 'ayurvedic',
    flavor: ['Unflavoured'],
    rating: 4.4,
    price_inr: 599,
    size_g: null,
    servings: 30,
    serving_size_g: 1,
    emoji: '🪨',
    nutrition_per_serving: {
      fulvic_acid_pct: 6.7, trace_minerals: 85,
    },
    science_note: 'Contains 85+ trace minerals and fulvic acid — chelates minerals for optimal absorption. Studies show 19% increase in testosterone and improvement in sperm quality.',
    best_time: 'Morning with warm water or milk',
    tags: ['Testosterone', 'Energy', 'Mineral Complex', 'Ayurvedic'],
    suitable_for: ['gym', 'general'],
    color: '#84cc16',
    bg: '#f0fdf4',
  },
  {
    id: 'patanjali-amla-juice',
    name: 'Amla Juice',
    brand: 'Patanjali',
    category: 'ayurvedic',
    flavor: ['Natural'],
    rating: 4.3,
    price_inr: 149,
    size_g: 500,
    servings: 33,
    serving_size_g: 15,
    emoji: '🍃',
    nutrition_per_serving: {
      calories: 6, vitamin_c_mg: 90, iron_enhancer: true,
    },
    science_note: 'Amla Vitamin C (ascorbate + tannin complex) is 20× more stable than synthetic ascorbic acid. Takes 30 min to neutralize tea tannins blocking iron absorption.',
    best_time: 'With iron-rich meals or 1 hr before tea/coffee',
    tags: ['Vitamin C', 'Iron Absorption', 'Antioxidant', 'Budget'],
    suitable_for: ['general', 'anemia', 'immunity'],
    color: '#84cc16',
    bg: '#f0fdf4',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SupplementCard({ supplement, onAdd, isAdded, onAddToPlan }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedFlavor, setSelectedFlavor] = useState(supplement.flavor[0])

  const costPerServing = supplement.price_inr && supplement.servings
    ? (supplement.price_inr / supplement.servings).toFixed(1)
    : null

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isAdded ? 'border-primary shadow-md shadow-primary/10' : 'border-gray-100 hover:shadow-md hover:border-gray-200'}`}>
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: supplement.bg }}
          >
            {supplement.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-snug">{supplement.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{supplement.brand}</p>
              </div>
              {isAdded && (
                <span className="flex-shrink-0 flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                  <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '12px' }}>check</span>
                  Added
                </span>
              )}
            </div>
            {/* Rating + tags */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined overflow-hidden"
                    style={{ fontSize: '12px', color: i < Math.round(supplement.rating) ? '#f59e0b' : '#d1d5db' }}
                  >
                    star
                  </span>
                ))}
                <span className="text-xs text-gray-500 ml-1">{supplement.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {supplement.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: supplement.bg, color: supplement.color }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Nutrition per serving */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {supplement.nutrition_per_serving.calories !== undefined && (
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <p className="text-sm font-bold text-gray-800">{supplement.nutrition_per_serving.calories}</p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
          )}
          {supplement.nutrition_per_serving.protein_g !== undefined && (
            <div className="text-center bg-purple-50 rounded-lg p-2">
              <p className="text-sm font-bold text-purple-700">{supplement.nutrition_per_serving.protein_g}g</p>
              <p className="text-xs text-purple-500">Protein</p>
            </div>
          )}
          {supplement.nutrition_per_serving.carbs_g !== undefined && (
            <div className="text-center bg-amber-50 rounded-lg p-2">
              <p className="text-sm font-bold text-amber-700">{supplement.nutrition_per_serving.carbs_g}g</p>
              <p className="text-xs text-amber-500">Carbs</p>
            </div>
          )}
          {supplement.nutrition_per_serving.creatine_g !== undefined && (
            <div className="text-center bg-amber-50 rounded-lg p-2 col-span-2">
              <p className="text-sm font-bold text-amber-700">{supplement.nutrition_per_serving.creatine_g}g</p>
              <p className="text-xs text-amber-500">Creatine</p>
            </div>
          )}
          {supplement.nutrition_per_serving.epa_mg !== undefined && (
            <div className="text-center bg-blue-50 rounded-lg p-2">
              <p className="text-sm font-bold text-blue-700">{supplement.nutrition_per_serving.epa_mg}mg</p>
              <p className="text-xs text-blue-500">EPA</p>
            </div>
          )}
          {supplement.nutrition_per_serving.dha_mg !== undefined && (
            <div className="text-center bg-blue-50 rounded-lg p-2">
              <p className="text-sm font-bold text-blue-700">{supplement.nutrition_per_serving.dha_mg}mg</p>
              <p className="text-xs text-blue-500">DHA</p>
            </div>
          )}
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors py-1"
        >
          <span>{expanded ? 'Less' : 'Science & Details'}</span>
          <span className="material-symbols-outlined overflow-hidden transition-transform" style={{ fontSize: '14px', transform: expanded ? 'rotate(180deg)' : 'none' }}>expand_more</span>
        </button>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {/* Science note */}
          <div className="bg-blue-50 rounded-xl px-3 py-2.5">
            <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>science</span>
              Science Note
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">{supplement.science_note}</p>
          </div>

          {/* Best time */}
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined overflow-hidden text-green-500 flex-shrink-0" style={{ fontSize: '16px' }}>schedule</span>
            <div>
              <p className="text-xs font-semibold text-gray-700">Best Time</p>
              <p className="text-xs text-gray-500">{supplement.best_time}</p>
            </div>
          </div>

          {/* Size & servings */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {supplement.size_g && (
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-bold text-gray-800">{supplement.size_g}g</p>
                <p className="text-xs text-gray-400">Pack Size</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-sm font-bold text-gray-800">{supplement.servings}</p>
              <p className="text-xs text-gray-400">Servings</p>
            </div>
            {costPerServing && (
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-sm font-bold text-green-700">₹{costPerServing}</p>
                <p className="text-xs text-green-500">Per Serving</p>
              </div>
            )}
          </div>

          {/* Flavor selector */}
          {supplement.flavor.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Flavor</p>
              <div className="flex flex-wrap gap-1.5">
                {supplement.flavor.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFlavor(f)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      selectedFlavor === f
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            {supplement.price_inr && (
              <p className="text-base font-bold text-gray-800">₹{supplement.price_inr.toLocaleString('en-IN')}</p>
            )}
            {supplement.serving_size_g && (
              <p className="text-xs text-gray-400">per {supplement.serving_size_g}g serving</p>
            )}
          </div>
          <button
            onClick={() => onAdd(supplement)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isAdded
                ? 'bg-primary/10 text-primary'
                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
            }`}
          >
            <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '16px' }}>
              {isAdded ? 'check_circle' : 'add_circle'}
            </span>
            {isAdded ? 'In Stack' : 'Add to Stack'}
          </button>
        </div>
        {/* Add to Meal Plan */}
        <button
          onClick={() => onAddToPlan(supplement)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-secondary/30 text-secondary text-xs font-semibold hover:bg-secondary/10 transition-colors"
        >
          <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>calendar_add_on</span>
          Add to Meal Plan
        </button>
      </div>
    </div>
  )
}

function StackPanel({ stack, onRemove }) {
  const totalCostPerDay = stack.reduce((sum, s) => {
    if (!s.price_inr || !s.servings) return sum
    return sum + s.price_inr / s.servings
  }, 0)

  if (!stack.length) return null

  return (
    <div className="bg-white rounded-2xl border border-primary/20 p-5 shadow-lg shadow-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined overflow-hidden text-primary" style={{ fontSize: '20px' }}>layers</span>
          My Supplement Stack
        </h3>
        <span className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-semibold">
          {stack.length} item{stack.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2 mb-4">
        {stack.map((s) => (
          <div key={s.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
            <span className="text-xl">{s.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
              <p className="text-xs text-gray-500">{s.brand} · {s.best_time.split(' ').slice(0, 3).join(' ')}</p>
            </div>
            <button
              onClick={() => onRemove(s.id)}
              className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 flex-shrink-0"
            >
              <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>close</span>
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Est. daily cost</p>
          <p className="text-sm font-bold text-primary">₹{totalCostPerDay.toFixed(0)}/day</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Monthly</p>
          <p className="text-sm font-bold text-gray-700">₹{(totalCostPerDay * 30).toFixed(0)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupplementsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [stack, setStack] = useState([])
  const [addToPlanItem, setAddToPlanItem] = useState(null)

  // Convert supplement to a food-like item for AddToPlanModal
  const toFoodItem = (supp) => ({
    id: supp.id,
    name: supp.name,
    food_emoji: supp.emoji,
    source: 'supplement',
    nutrition: {
      calories:   supp.nutrition_per_serving?.calories  ?? 0,
      protein_g:  supp.nutrition_per_serving?.protein_g ?? 0,
      carbs_g:    supp.nutrition_per_serving?.carbs_g   ?? 0,
      fat_g:      supp.nutrition_per_serving?.fat_g     ?? 0,
    },
  })

  const filtered = useMemo(() => {
    let list = SUPPLEMENTS
    if (activeCategory !== 'all') list = list.filter((s) => s.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [activeCategory, search])

  const addToStack = (supplement) => {
    setStack((prev) => prev.find((s) => s.id === supplement.id) ? prev : [...prev, supplement])
  }

  const removeFromStack = (id) => setStack((prev) => prev.filter((s) => s.id !== id))

  const stackIds = new Set(stack.map((s) => s.id))

  return (
    <div className="min-h-screen bg-surface">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-on-surface font-display">Supplements</h1>
              <p className="text-sm text-gray-500 mt-0.5">Science-backed supplements with Indian brands · Build your stack</p>
            </div>
            {stack.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-xl px-3 py-2">
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '18px' }}>layers</span>
                <span className="text-sm font-semibold">{stack.length} in stack</span>
              </div>
            )}
          </div>
          {/* Search */}
          <div className="mt-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined overflow-hidden text-gray-400" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplements, brands, benefits..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-gray-50"
            />
          </div>
          {/* Category tabs */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {SUPPLEMENT_CATEGORIES.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '15px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main grid */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-4">
              {filtered.length} supplement{filtered.length !== 1 ? 's' : ''} found
            </p>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <span className="material-symbols-outlined overflow-hidden text-gray-300 block mb-3" style={{ fontSize: '48px' }}>search_off</span>
                <p className="text-gray-500 font-medium">No supplements found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different category or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((supplement) => (
                  <SupplementCard
                    key={supplement.id}
                    supplement={supplement}
                    onAdd={addToStack}
                    isAdded={stackIds.has(supplement.id)}
                    onAddToPlan={(s) => setAddToPlanItem(toFoodItem(s))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stack panel — sidebar on desktop */}
          {stack.length > 0 && (
            <div className="w-72 flex-shrink-0 hidden lg:block">
              <div className="sticky top-40">
                <StackPanel stack={stack} onRemove={removeFromStack} />
                {/* Conflict check between stack items */}
                {stack.some((s) => s.category === 'vitamins' && s.name.toLowerCase().includes('vitamin d')) &&
                  stack.some((s) => s.category === 'omega3') && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>tips_and_updates</span>
                      Stack Tip
                    </p>
                    <p className="text-xs text-amber-700">Vitamin D3 + Omega-3 taken together enhance each other's absorption. Take both with your largest meal.</p>
                  </div>
                )}
                {stack.some((s) => s.category === 'creatine') && stack.some((s) => s.category === 'protein') && (
                  <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined overflow-hidden" style={{ fontSize: '14px' }}>verified</span>
                      Synergy
                    </p>
                    <p className="text-xs text-green-700">Creatine + Whey Protein is the most validated supplement combination. Take together post-workout for maximum muscle synthesis.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile stack panel */}
        {stack.length > 0 && (
          <div className="mt-6 lg:hidden">
            <StackPanel stack={stack} onRemove={removeFromStack} />
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <span className="material-symbols-outlined overflow-hidden text-gray-400 flex-shrink-0" style={{ fontSize: '16px' }}>info</span>
            Supplement information is for educational purposes only. Always consult your doctor or registered dietitian before starting any supplement, especially if you have a medical condition or are on medication. Price estimates are indicative and may vary.
          </p>
        </div>
      </div>

      {/* Add to Plan modal */}
      {addToPlanItem && (
        <AddToPlanModal item={addToPlanItem} onClose={() => setAddToPlanItem(null)} />
      )}
    </div>
  )
}
