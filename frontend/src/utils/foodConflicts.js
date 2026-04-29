/**
 * Food Conflict Detection Utility
 * Checks food combinations for nutrient absorption conflicts
 */

export const FOOD_CONFLICTS = [
  {
    id: 'iron-calcium',
    title: 'Iron + Calcium',
    severity: 'high',
    mechanism: 'Calcium competes with iron for the DMT-1 intestinal transporter, reducing iron absorption by 30–60%.',
    foods_a_keywords: ['spinach', 'palak', 'methi', 'ragi', 'rajma', 'dal', 'lentil', 'drumstick', 'amaranth', 'horsegram', 'masoor', 'toor', 'urad', 'moong', 'chana'],
    foods_b_keywords: ['milk', 'paneer', 'curd', 'dahi', 'cheese', 'butter', 'ghee', 'buttermilk', 'chaas'],
    health_tags_a: ['Iron-Rich'],
    health_tags_b: ['Calcium-Rich'],
    tip: 'Separate iron-rich foods and dairy by at least 2 hours. Add lemon juice to iron-rich meals instead to boost absorption 3×.',
    alternatives: ['Replace paneer with tofu in iron-rich meal', 'Drink buttermilk 2h after dal-spinach', 'Use lemon tadka for flavor instead of dairy'],
    affects_conditions: ['pcod', 'anemia', 'pregnancy'],
  },
  {
    id: 'iron-tannins',
    title: 'Iron-Rich Foods + Tea / Coffee',
    severity: 'high',
    mechanism: 'Tannins in tea and chlorogenic acid in coffee form insoluble complexes with non-heme iron, blocking 60–70% of absorption.',
    foods_a_keywords: ['spinach', 'palak', 'dal', 'ragi', 'rajma', 'methi', 'amaranth', 'drumstick', 'moringa', 'chana', 'lentil'],
    foods_b_keywords: ['tea', 'coffee', 'chai', 'green tea'],
    health_tags_a: ['Iron-Rich'],
    health_tags_b: [],
    tip: 'Avoid tea/coffee 1 hour before and 2 hours after iron-rich meals. Drink amla juice instead — it boosts iron absorption.',
    alternatives: ['Herbal tea (tulsi, ginger) is safe with iron-rich meals', 'Drink amla juice with dal', 'Choose green smoothie over chai at meal time'],
    affects_conditions: ['pcod', 'anemia', 'pregnancy'],
  },
  {
    id: 'oxalate-calcium',
    title: 'High-Oxalate Foods + Calcium',
    severity: 'medium',
    mechanism: 'Oxalic acid in spinach and beets binds calcium to form insoluble calcium oxalate — reducing calcium absorption and increasing kidney stone risk.',
    foods_a_keywords: ['spinach', 'palak', 'beetroot', 'beet', 'rhubarb', 'almonds'],
    foods_b_keywords: ['milk', 'paneer', 'curd', 'dahi', 'calcium'],
    health_tags_a: [],
    health_tags_b: ['Calcium-Rich'],
    tip: 'Blanch or cook spinach to reduce oxalate by 50%. Use low-oxalate greens like moringa or amaranth with dairy.',
    alternatives: ['Blanch spinach before combining with paneer', 'Use moringa leaves instead of spinach in milk-based dishes', 'Pair calcium with ragi which has no oxalate'],
    affects_conditions: ['kidney', 'bone_health'],
  },
  {
    id: 'phytate-minerals',
    title: 'Unsoaked Grains/Legumes + Iron & Zinc',
    severity: 'medium',
    mechanism: 'Phytic acid in unsoaked legumes chelates zinc and iron, making them unavailable. Up to 50% of mineral content is lost.',
    foods_a_keywords: ['unsoaked', 'raw wheat', 'wheat bran'],
    foods_b_keywords: [],
    health_tags_a: [],
    health_tags_b: ['Iron-Rich', 'Zinc-Rich'],
    tip: 'Soak legumes 8–12 hours before cooking. Sprouting and fermenting reduce phytate by 50–75%. Fermented idli/dosa batter is ideal.',
    alternatives: ['Soak all rajma, chana overnight', 'Use sprouted moong instead of raw', 'Choose fermented idli/dosa over plain grain'],
    affects_conditions: ['anemia', 'pcod'],
  },
  {
    id: 'fat-soluble-no-fat',
    title: 'Fat-Soluble Vitamins (A/D/E/K) + Fat-Free Meal',
    severity: 'medium',
    mechanism: 'Vitamins A, D, E, and K require dietary fat for absorption. Without fat, absorption drops by up to 90%.',
    foods_a_keywords: ['carrot', 'sweet potato', 'moringa', 'spinach', 'palak', 'pumpkin', 'mango'],
    foods_b_keywords: ['fat-free', 'skimmed', 'no oil', 'boiled without fat'],
    health_tags_a: ['Vitamin-D-Rich'],
    health_tags_b: [],
    tip: 'Always cook or dress fat-soluble vitamin foods with at least 1 tsp of healthy fat (ghee, sesame oil, coconut oil).',
    alternatives: ['Add half teaspoon ghee to carrot sabzi', 'Dress raw salads with sesame oil', 'Cook sweet potato in coconut oil'],
    affects_conditions: ['thyroid', 'bone_health'],
  },
  {
    id: 'omega3-omega6',
    title: 'Omega-3 Rich Foods + Excess Omega-6 Oils',
    severity: 'medium',
    mechanism: 'Omega-6 and Omega-3 compete for the same elongase/desaturase enzymes. High omega-6 suppresses ALA → DHA/EPA conversion by up to 80%.',
    foods_a_keywords: ['flaxseed', 'walnut', 'chia', 'hemp', 'alsi'],
    foods_b_keywords: ['sunflower oil', 'corn oil', 'soybean oil', 'vegetable oil', 'refined oil'],
    health_tags_a: ['Omega-3-Rich'],
    health_tags_b: [],
    tip: 'Use ghee or coconut oil for cooking when consuming omega-3-rich foods. Maintain omega-6:omega-3 ratio below 4:1.',
    alternatives: ['Cook with ghee or coconut oil instead of sunflower oil', 'Use cold-pressed flaxseed oil as salad dressing', 'Choose mustard oil for cooking (lower omega-6 ratio)'],
    affects_conditions: ['hypertension', 'pcod'],
  },
  {
    id: 'thyroid-goitrogens',
    title: 'Raw Cruciferous Vegetables + Thyroid',
    severity: 'high',
    mechanism: 'Goitrogens in raw cabbage, cauliflower, broccoli block iodine uptake by the thyroid — suppressing T4 synthesis. Cooking reduces goitrogens by 50–70%.',
    foods_a_keywords: ['cabbage', 'cauliflower', 'broccoli', 'radish', 'mustard', 'kale', 'brussels'],
    foods_b_keywords: ['thyroid', 'thyroxine', 'levothyroxine', 'iodine'],
    health_tags_a: [],
    health_tags_b: ['Thyroid-Support'],
    tip: 'Always cook cruciferous vegetables for thyroid patients. Steam or stir-fry to inactivate goitrogens.',
    alternatives: ['Cook all cruciferous vegetables', 'Choose cooked broccoli/cauliflower over raw', 'Eat goitrogenic vegetables 4h away from thyroid medication'],
    affects_conditions: ['thyroid'],
  },
  {
    id: 'zinc-calcium',
    title: 'Zinc + Excess Calcium Supplementation',
    severity: 'medium',
    mechanism: 'High-dose calcium supplements (>500mg/dose) reduce zinc absorption. Food-form calcium is safe due to natural balance with zinc.',
    foods_a_keywords: ['pumpkin seeds', 'sesame', 'cashew', 'hemp seeds', 'watermelon seeds'],
    foods_b_keywords: ['calcium tablet', 'calcium carbonate', 'calcium supplement'],
    health_tags_a: ['Zinc-Rich'],
    health_tags_b: [],
    tip: 'Take calcium supplements and zinc-rich snacks at different times. Food sources of calcium and zinc are naturally balanced.',
    alternatives: ['Take calcium supplement at night, zinc-rich snacks during day', 'Use sesame (til) which contains both calcium and zinc naturally'],
    affects_conditions: ['pcod', 'bone_health'],
  },
  {
    id: 'sugar-insulin',
    title: 'High Sugar + Chromium (Blood Sugar Spikes)',
    severity: 'medium',
    mechanism: 'High-glycemic meals cause urinary chromium loss — reducing insulin sensitivity and worsening blood sugar regulation over time.',
    foods_a_keywords: ['sugar', 'jaggery', 'maida', 'white bread', 'fruit juice', 'cold drink', 'sweet'],
    foods_b_keywords: [],
    health_tags_a: [],
    health_tags_b: ['Diabetic-Friendly'],
    tip: 'Combine refined carbs with protein and fiber to reduce glycemic load. Choose low-GI alternatives.',
    alternatives: ['Replace white rice with red rice or millets', 'Combine jaggery-based sweets with nuts to lower GI', 'Add lentils or yogurt to reduce meal GI'],
    affects_conditions: ['diabetes', 'pcod'],
  },
  {
    id: 'raw-egg-biotin',
    title: 'Raw Egg White + Biotin',
    severity: 'medium',
    mechanism: 'Avidin in raw egg white tightly binds biotin (Vitamin B7), completely blocking its absorption. Cooking denatures avidin — safe.',
    foods_a_keywords: ['raw egg', 'uncooked egg white', 'egg white shake'],
    foods_b_keywords: ['sweet potato', 'nuts', 'peanuts', 'almonds', 'biotin'],
    health_tags_a: [],
    health_tags_b: [],
    tip: 'Always cook eggs fully. Cooked egg whites do NOT block biotin. Only raw whites are the problem.',
    alternatives: ['Scrambled eggs', 'Boiled eggs', 'Poached eggs — all safe'],
    affects_conditions: ['general', 'pcod'],
  },
]

/**
 * Check a single meal slot (array of food items) for conflicts
 * @param {Array} mealItems - array of { food, portion_g } objects
 * @returns {Array} conflicts found
 */
export function checkMealConflicts(mealItems) {
  if (!mealItems || mealItems.length < 2) return []
  const foods = mealItems.map((item) => item.food || item)
  const found = []

  FOOD_CONFLICTS.forEach((conflict) => {
    const matchFood = (f, keywords, tags) => {
      const name = (f.name || '').toLowerCase()
      const htags = (f.health_tags || []).join(' ').toLowerCase()
      const desc = (f.description || '').toLowerCase()
      return (
        keywords.some((kw) => name.includes(kw.toLowerCase()) || desc.includes(kw.toLowerCase())) ||
        tags.some((tag) => htags.includes(tag.toLowerCase()))
      )
    }

    const hasA = foods.some((f) => matchFood(f, conflict.foods_a_keywords, conflict.health_tags_a))
    const hasB = foods.some((f) => matchFood(f, conflict.foods_b_keywords, conflict.health_tags_b))

    if (hasA && hasB && !found.find((c) => c.id === conflict.id)) {
      found.push(conflict)
    }
  })

  return found
}

/**
 * Check conflicts across an entire day plan
 * @param {Object} dayPlan - { breakfast: [], lunch: [], dinner: [], snack: [] }
 * @returns {Object} { slotName: conflicts[] }
 */
export function checkDayConflicts(dayPlan) {
  const result = {}
  const slots = ['breakfast', 'lunch', 'dinner', 'snack']
  slots.forEach((slot) => {
    const items = dayPlan[slot] || []
    const conflicts = checkMealConflicts(items)
    if (conflicts.length > 0) result[slot] = conflicts
  })
  return result
}

/**
 * Get severity color classes for a conflict
 */
export function getConflictSeverityStyle(severity) {
  return {
    high:   { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   icon: 'text-red-500' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' },
    low:    { bg: 'bg-gray-50',  border: 'border-gray-200',  text: 'text-gray-600',  icon: 'text-gray-400' },
  }[severity] || { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' }
}
