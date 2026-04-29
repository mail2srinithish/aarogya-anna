/**
 * Indian Foods Database — Individual Food Items
 * Nutrition values per 100g from ICMR-NIN Indian Food Composition Tables 2017
 * Source: NIN IFCT 2017, USDA FoodData Central
 */

function hs(n) {
  // health score formula
  return Math.min(100, Math.round(
    (n.fiber_g / 28 * 15) +
    (n.protein_g / 50 * 20) +
    (Math.max(0, 1 - n.sugar_g / 50) * 15) +
    (n.iron_mg / 21 * 15) +
    (n.vitamin_c_mg / 80 * 15) +
    (n.calcium_mg / 1000 * 10) +
    (n.omega3_g / 1.2 * 10)
  ))
}

const base = {
  serving_size_g: 100,
  source: 'food_item',
  steps: [],
  ingredients: [],
  prep_time_mins: 0,
  cook_time_mins: 0,
  servings: 1,
  rating: 4.2,
  reviews: 120,
  ayurveda_type: 'sattvic',
  season_tags: ['all-year'],
  festival_tags: [],
  region: 'south',
  state: 'India',
}

function food(id, name, regional, cat, emoji, mealType, dietType, healthTags, nutrition, description) {
  return {
    ...base,
    id: `food_${id}`,
    name,
    name_regional: regional,
    category: cat,
    food_emoji: emoji,
    meal_type: mealType,
    diet_type: dietType,
    health_tags: healthTags,
    cuisine_tags: ['indian', cat],
    nutrition: {
      ...nutrition,
      serving_size_g: 100,
      glycemic_index: nutrition.glycemic_index ?? 55,
      saturated_fat_g: Math.round((nutrition.fat_g || 0) * 0.3 * 10) / 10,
      trans_fat_g: 0,
      cholesterol_mg: dietType.includes('non-vegetarian') ? 80 : 0,
      potassium_mg: nutrition.potassium_mg ?? 300,
      phosphorus_mg: nutrition.phosphorus_mg ?? 80,
      vitamin_a_mcg: nutrition.vitamin_a_mcg ?? 10,
      vitamin_b12_mcg: nutrition.vitamin_b12_mcg ?? 0,
      epa_mg: nutrition.epa_mg ?? 0,
    },
    health_score: hs(nutrition),
    description,
    image_url: null,
  }
}

// ─── FRUITS ───────────────────────────────────────────────────────────────────

const fruits = [
  food('mango', 'Mango (Ripe)', 'Mango | ஆம்பழம் | आम', 'fruit', '🥭', 'snack', ['vegetarian', 'vegan'],
    ['Vitamin-D-Rich', 'Immune-Boost', 'Energy-Dense', 'Anti-Inflammatory'],
    { calories: 60, protein_g: 0.8, carbs_g: 15, fat_g: 0.4, fiber_g: 1.6, sugar_g: 13.7, sodium_mg: 1, iron_mg: 0.2, calcium_mg: 11, magnesium_mg: 10, zinc_mg: 0.1, potassium_mg: 168, phosphorus_mg: 14, vitamin_c_mg: 36, vitamin_a_mcg: 54, vitamin_d_mcg: 0, folate_mcg: 43, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 51 },
    'Rich in beta-carotene, Vitamin C and natural enzymes that aid digestion.'),

  food('banana', 'Banana', 'Banana | வாழைப்பழம் | केला', 'fruit', '🍌', 'snack', ['vegetarian', 'vegan'],
    ['Energy-Dense', 'Magnesium-Rich', 'Gut-Health', 'High-Fiber'],
    { calories: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, fiber_g: 2.6, sugar_g: 12, sodium_mg: 1, iron_mg: 0.3, calcium_mg: 5, magnesium_mg: 27, zinc_mg: 0.2, potassium_mg: 358, phosphorus_mg: 22, vitamin_c_mg: 8.7, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 20, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 51 },
    'Excellent source of potassium and magnesium. Pre-workout energy and post-workout recovery.'),

  food('papaya', 'Papaya', 'Papaya | பப்பாளி | पपीता', 'fruit', '🍈', 'snack', ['vegetarian', 'vegan'],
    ['Gut-Health', 'Immune-Boost', 'Low-GI', 'Anti-Inflammatory', 'Diabetic-Friendly'],
    { calories: 43, protein_g: 0.5, carbs_g: 11, fat_g: 0.3, fiber_g: 1.7, sugar_g: 7.8, sodium_mg: 8, iron_mg: 0.3, calcium_mg: 20, magnesium_mg: 21, zinc_mg: 0.1, potassium_mg: 182, phosphorus_mg: 10, vitamin_c_mg: 62, vitamin_a_mcg: 47, vitamin_d_mcg: 0, folate_mcg: 37, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 59 },
    'Contains papain enzyme that aids protein digestion. High in Vitamin C and carotenoids.'),

  food('guava', 'Guava', 'Guava | கொய்யா | अमरूद', 'fruit', '🍐', 'snack', ['vegetarian', 'vegan'],
    ['Immune-Boost', 'High-Fiber', 'Low-GI', 'Diabetic-Friendly', 'PCOD-Friendly'],
    { calories: 68, protein_g: 2.6, carbs_g: 14.3, fat_g: 1, fiber_g: 5.4, sugar_g: 8.9, sodium_mg: 2, iron_mg: 0.3, calcium_mg: 18, magnesium_mg: 22, zinc_mg: 0.2, potassium_mg: 417, phosphorus_mg: 40, vitamin_c_mg: 228, vitamin_a_mcg: 31, vitamin_d_mcg: 0, folate_mcg: 49, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.11, dha_mg: 0, glycemic_index: 31 },
    'One of the richest sources of Vitamin C — 228mg per 100g (3× more than orange). High fiber controls blood sugar.'),

  food('amla', 'Amla (Indian Gooseberry)', 'Amla | நெல்லிக்காய் | आंवला', 'fruit', '🫑', 'snack', ['vegetarian', 'vegan'],
    ['Immune-Boost', 'Iron-Rich', 'Anti-Inflammatory', 'Detox', 'PCOD-Friendly'],
    { calories: 58, protein_g: 0.9, carbs_g: 13.7, fat_g: 0.1, fiber_g: 3.4, sugar_g: 10, sodium_mg: 1, iron_mg: 1.2, calcium_mg: 25, magnesium_mg: 10, zinc_mg: 0.1, potassium_mg: 198, phosphorus_mg: 27, vitamin_c_mg: 600, vitamin_a_mcg: 15, vitamin_d_mcg: 0, folate_mcg: 6, selenium_mcg: 0.1, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 40 },
    'Extremely high in Vitamin C (600mg/100g) — 8× more than orange. Used in Ayurveda for immunity, hair, and liver health.'),

  food('pomegranate', 'Pomegranate', 'Pomegranate | மாதுளை | अनार', 'fruit', '🫐', 'snack', ['vegetarian', 'vegan'],
    ['Heart-Healthy', 'Anti-Inflammatory', 'Iron-Rich', 'PCOD-Friendly', 'Hypertension-Safe'],
    { calories: 83, protein_g: 1.7, carbs_g: 18.7, fat_g: 1.2, fiber_g: 4, sugar_g: 13.7, sodium_mg: 3, iron_mg: 0.3, calcium_mg: 10, magnesium_mg: 12, zinc_mg: 0.4, potassium_mg: 236, phosphorus_mg: 36, vitamin_c_mg: 10.2, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 38, selenium_mcg: 0.5, iodine_mcg: 0, omega3_g: 0.09, dha_mg: 0, glycemic_index: 35 },
    'Rich in punicalagins and anthocyanins — among the most potent antioxidants in fruits. Reduces blood pressure.'),

  food('dates', 'Dates (Khajoor)', 'Dates | பேரீச்சம்பழம் | खजूर', 'fruit', '🟤', 'snack', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Energy-Dense', 'Folate-Rich', 'Magnesium-Rich'],
    { calories: 277, protein_g: 1.8, carbs_g: 75, fat_g: 0.2, fiber_g: 6.7, sugar_g: 63.4, sodium_mg: 1, iron_mg: 0.9, calcium_mg: 64, magnesium_mg: 54, zinc_mg: 0.4, potassium_mg: 696, phosphorus_mg: 62, vitamin_c_mg: 0.4, vitamin_a_mcg: 7, vitamin_d_mcg: 0, folate_mcg: 15, selenium_mcg: 3, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 42 },
    'Natural energy dense food rich in potassium, magnesium, and iron. Used traditionally for pregnancy nutrition.'),

  food('coconut_fresh', 'Fresh Coconut (Grated)', 'Fresh Coconut | தேங்காய் | नारियल', 'fruit', '🥥', 'any', ['vegetarian', 'vegan'],
    ['Energy-Dense', 'Heart-Healthy', 'Sattvic', 'Traditional'],
    { calories: 354, protein_g: 3.3, carbs_g: 15.2, fat_g: 33.5, fiber_g: 9, sugar_g: 6.2, sodium_mg: 20, iron_mg: 2.4, calcium_mg: 14, magnesium_mg: 32, zinc_mg: 1.1, potassium_mg: 356, phosphorus_mg: 113, vitamin_c_mg: 3.3, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 26, selenium_mcg: 10.1, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 45 },
    'Rich in medium-chain fatty acids (MCTs) that are rapidly metabolized for energy. Essential in South Indian cooking.'),

  food('jackfruit', 'Jackfruit (Kathal)', 'Jackfruit | பலா | कटहल', 'fruit', '💚', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'High-Fiber', 'Energy-Dense', 'Gut-Health'],
    { calories: 95, protein_g: 1.7, carbs_g: 23.2, fat_g: 0.6, fiber_g: 1.5, sugar_g: 19.1, sodium_mg: 2, iron_mg: 0.6, calcium_mg: 34, magnesium_mg: 37, zinc_mg: 0.4, potassium_mg: 448, phosphorus_mg: 36, vitamin_c_mg: 6.7, vitamin_a_mcg: 5, vitamin_d_mcg: 0, folate_mcg: 24, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 50 },
    'Young green jackfruit is a popular meat substitute. Rich in B vitamins and minerals.'),

  food('watermelon', 'Watermelon', 'Watermelon | தர்பூசணி | तरबूज', 'fruit', '🍉', 'snack', ['vegetarian', 'vegan'],
    ['Hypertension-Safe', 'Low-GI', 'Immune-Boost', 'Detox'],
    { calories: 30, protein_g: 0.6, carbs_g: 7.6, fat_g: 0.2, fiber_g: 0.4, sugar_g: 6.2, sodium_mg: 1, iron_mg: 0.2, calcium_mg: 7, magnesium_mg: 10, zinc_mg: 0.1, potassium_mg: 112, phosphorus_mg: 11, vitamin_c_mg: 8.1, vitamin_a_mcg: 28, vitamin_d_mcg: 0, folate_mcg: 3, selenium_mcg: 0.4, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 72 },
    'High in lycopene (red pigment) — a powerful antioxidant. Rich in citrulline which reduces blood pressure.'),

  food('tamarind', 'Tamarind (Imli)', 'Tamarind | புளி | इमली', 'spice', '🟫', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Gut-Health', 'Immune-Boost', 'Traditional'],
    { calories: 239, protein_g: 2.8, carbs_g: 62.5, fat_g: 0.6, fiber_g: 5.1, sugar_g: 57.4, sodium_mg: 28, iron_mg: 2.8, calcium_mg: 74, magnesium_mg: 92, zinc_mg: 0.1, potassium_mg: 628, phosphorus_mg: 113, vitamin_c_mg: 3.5, vitamin_a_mcg: 2, vitamin_d_mcg: 0, folate_mcg: 14, selenium_mcg: 1.3, iodine_mcg: 0, omega3_g: 0.07, dha_mg: 0, glycemic_index: 65 },
    'Excellent source of iron and tartaric acid. Used in South Indian cooking for its digestive properties.'),

  food('fig', 'Fig (Anjeer)', 'Fig | அத்திப்பழம் | अंजीर', 'fruit', '🟤', 'snack', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'Bone-Health', 'High-Fiber'],
    { calories: 74, protein_g: 0.8, carbs_g: 19.2, fat_g: 0.3, fiber_g: 2.9, sugar_g: 16.3, sodium_mg: 1, iron_mg: 0.4, calcium_mg: 35, magnesium_mg: 17, zinc_mg: 0.2, potassium_mg: 232, phosphorus_mg: 14, vitamin_c_mg: 2, vitamin_a_mcg: 7, vitamin_d_mcg: 0, folate_mcg: 6, selenium_mcg: 0.2, iodine_mcg: 0, omega3_g: 0.09, dha_mg: 0, glycemic_index: 61 },
    'One of the highest calcium-containing fruits. Rich in fiber and prebiotics that feed gut bacteria.'),

  food('sapota', 'Sapota (Chikoo)', 'Sapota | சப்போட்டா | चीकू', 'fruit', '🟤', 'snack', ['vegetarian', 'vegan'],
    ['Energy-Dense', 'Iron-Rich', 'Gut-Health'],
    { calories: 83, protein_g: 0.4, carbs_g: 20, fat_g: 1.1, fiber_g: 5.3, sugar_g: 14.7, sodium_mg: 12, iron_mg: 0.8, calcium_mg: 21, magnesium_mg: 12, zinc_mg: 0.1, potassium_mg: 193, phosphorus_mg: 12, vitamin_c_mg: 14.7, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 14, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 55 },
    'Rich in tannins which have astringent properties. High in dietary fiber and natural sugars.'),

  food('lemon', 'Lemon / Lime', 'Lemon | எலுமிச்சை | नींबू', 'fruit', '🍋', 'any', ['vegetarian', 'vegan'],
    ['Immune-Boost', 'Iron-Rich', 'Detox', 'Low-GI'],
    { calories: 29, protein_g: 1.1, carbs_g: 9.3, fat_g: 0.3, fiber_g: 2.8, sugar_g: 2.5, sodium_mg: 2, iron_mg: 0.6, calcium_mg: 26, magnesium_mg: 8, zinc_mg: 0.1, potassium_mg: 138, phosphorus_mg: 16, vitamin_c_mg: 53, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 11, selenium_mcg: 0.4, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 20 },
    'Critical iron absorption enhancer. Adding lemon juice to dal triples non-heme iron absorption via Vitamin C.'),
]

// ─── VEGETABLES ───────────────────────────────────────────────────────────────

const vegetables = [
  food('sweet_potato', 'Sweet Potato', 'Sweet Potato | சர்க்கரைவள்ளிக்கிழங்கு | शकरकंद', 'vegetable', '🍠', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Energy-Dense', 'Low-GI', 'Diabetic-Friendly', 'Anti-Inflammatory'],
    { calories: 86, protein_g: 1.6, carbs_g: 20.1, fat_g: 0.1, fiber_g: 3, sugar_g: 4.2, sodium_mg: 55, iron_mg: 0.6, calcium_mg: 30, magnesium_mg: 25, zinc_mg: 0.3, potassium_mg: 337, phosphorus_mg: 47, vitamin_c_mg: 2.4, vitamin_a_mcg: 961, vitamin_d_mcg: 0, folate_mcg: 11, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 50 },
    'Exceptional source of beta-carotene (Vitamin A). Low-GI complex carb ideal for pre-workout or diabetic diet.'),

  food('cassava', 'Cassava / Tapioca (Kappa)', 'Cassava | மரவள்ளிக்கிழங்கு | कसावा', 'vegetable', '🍡', 'any', ['vegetarian', 'vegan'],
    ['Energy-Dense', 'Gut-Health', 'Traditional'],
    { calories: 160, protein_g: 1.4, carbs_g: 38.1, fat_g: 0.3, fiber_g: 1.8, sugar_g: 1.7, sodium_mg: 14, iron_mg: 0.3, calcium_mg: 16, magnesium_mg: 21, zinc_mg: 0.3, potassium_mg: 271, phosphorus_mg: 27, vitamin_c_mg: 20.6, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 27, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 46 },
    'Staple in Kerala cuisine. Gluten-free, energy-dense root vegetable. Must be cooked properly to eliminate cyanogenic compounds.'),

  food('moringa_leaves', 'Moringa Leaves (Drumstick Leaves)', 'Moringa | முருங்கை இலை | सहजन पत्ते', 'vegetable', '🌿', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'High-Protein', 'PCOD-Friendly', 'Immune-Boost', 'Bone-Health'],
    { calories: 64, protein_g: 9.4, carbs_g: 8.3, fat_g: 1.4, fiber_g: 2, sugar_g: 2, sodium_mg: 9, iron_mg: 6.0, calcium_mg: 185, magnesium_mg: 42, zinc_mg: 0.6, potassium_mg: 337, phosphorus_mg: 112, vitamin_c_mg: 220, vitamin_a_mcg: 378, vitamin_d_mcg: 0, folate_mcg: 40, selenium_mcg: 0.9, iodine_mcg: 0, omega3_g: 0.16, dha_mg: 0, glycemic_index: 20 },
    'Called "miracle tree" — exceptional in protein (9.4g/100g), iron (6mg), calcium (185mg), Vitamin C (220mg), and beta-carotene. Ayurvedic superfood.'),

  food('methi_leaves', 'Fenugreek Leaves (Methi)', 'Methi | வெந்தயக்கீரை | मेथी', 'vegetable', '💚', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Folate-Rich', 'PCOD-Friendly', 'Diabetic-Friendly', 'Gut-Health'],
    { calories: 49, protein_g: 4.4, carbs_g: 6, fat_g: 0.9, fiber_g: 2.7, sugar_g: 0, sodium_mg: 67, iron_mg: 1.9, calcium_mg: 176, magnesium_mg: 37, zinc_mg: 0.5, potassium_mg: 770, phosphorus_mg: 51, vitamin_c_mg: 52, vitamin_a_mcg: 395, vitamin_d_mcg: 0, folate_mcg: 57, selenium_mcg: 0.9, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 25 },
    'Contains fenugreekine that regulates blood sugar. Rich in iron and folate — essential for PCOD and pregnancy.'),

  food('karela', 'Bitter Gourd (Karela)', 'Bitter Gourd | பாவக்காய் | करेला', 'vegetable', '🥒', 'any', ['vegetarian', 'vegan'],
    ['Diabetic-Friendly', 'Low-GI', 'Detox', 'PCOD-Friendly', 'Immune-Boost'],
    { calories: 17, protein_g: 1, carbs_g: 3.4, fat_g: 0.2, fiber_g: 2.8, sugar_g: 1.7, sodium_mg: 5, iron_mg: 0.4, calcium_mg: 19, magnesium_mg: 17, zinc_mg: 0.8, potassium_mg: 296, phosphorus_mg: 31, vitamin_c_mg: 84, vitamin_a_mcg: 6, vitamin_d_mcg: 0, folate_mcg: 72, selenium_mcg: 0.2, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 18 },
    'Contains charantin and polypeptide-p — compounds that mimic insulin and lower blood sugar. Lowest-calorie vegetable.'),

  food('drumstick_pods', 'Drumstick Pods (Murungakkai)', 'Drumstick | முருங்கைக்காய் | सहजन', 'vegetable', '🌿', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'Folate-Rich', 'Traditional'],
    { calories: 37, protein_g: 2.5, carbs_g: 8.5, fat_g: 0.1, fiber_g: 3.2, sugar_g: 0, sodium_mg: 42, iron_mg: 0.4, calcium_mg: 30, magnesium_mg: 45, zinc_mg: 0.5, potassium_mg: 461, phosphorus_mg: 50, vitamin_c_mg: 141, vitamin_a_mcg: 4, vitamin_d_mcg: 0, folate_mcg: 44, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 32 },
    'Used in sambar across South India. High in Vitamin C and minerals. Seeds contain ben oil with oleic acid.'),

  food('raw_banana', 'Raw Banana / Green Plantain', 'Raw Banana | வாழைக்காய் | कच्चा केला', 'vegetable', '🍌', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Gut-Health', 'Low-GI', 'Diabetic-Friendly'],
    { calories: 89, protein_g: 1.3, carbs_g: 22.8, fat_g: 0.3, fiber_g: 2.6, sugar_g: 0.9, sodium_mg: 4, iron_mg: 0.6, calcium_mg: 3, magnesium_mg: 37, zinc_mg: 0.2, potassium_mg: 499, phosphorus_mg: 34, vitamin_c_mg: 18.4, vitamin_a_mcg: 2, vitamin_d_mcg: 0, folate_mcg: 22, selenium_mcg: 1.5, iodine_mcg: 0, omega3_g: 0.07, dha_mg: 0, glycemic_index: 45 },
    'High in resistant starch which feeds gut bacteria and improves insulin sensitivity. Low-GI alternative to potato.'),

  food('yam', 'Yam (Suran)', 'Yam | சேனைக்கிழங்கு | सूरन', 'vegetable', '🥔', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Energy-Dense', 'Low-GI', 'Traditional'],
    { calories: 118, protein_g: 1.5, carbs_g: 27.9, fat_g: 0.2, fiber_g: 4.1, sugar_g: 0.5, sodium_mg: 9, iron_mg: 0.5, calcium_mg: 17, magnesium_mg: 21, zinc_mg: 0.2, potassium_mg: 816, phosphorus_mg: 55, vitamin_c_mg: 17.1, vitamin_a_mcg: 8, vitamin_d_mcg: 0, folate_mcg: 23, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.11, dha_mg: 0, glycemic_index: 54 },
    'Rich in diosgenin — a steroid sapogenin used in synthesis of steroid hormones. Good energy source with decent fiber.'),

  food('amaranth_leaves', 'Amaranth Leaves (Thotakura)', 'Amaranth | முளைக்கீரை | चौलाई', 'vegetable', '🌱', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'High-Protein', 'Folate-Rich', 'PCOD-Friendly'],
    { calories: 23, protein_g: 2.5, carbs_g: 4, fat_g: 0.3, fiber_g: 2.2, sugar_g: 0, sodium_mg: 20, iron_mg: 2.3, calcium_mg: 215, magnesium_mg: 55, zinc_mg: 0.9, potassium_mg: 611, phosphorus_mg: 50, vitamin_c_mg: 43.3, vitamin_a_mcg: 292, vitamin_d_mcg: 0, folate_mcg: 85, selenium_mcg: 0.9, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 20 },
    'Nutritionally superior leafy green — more calcium than spinach with less oxalate. Rich in iron and folate.'),

  food('lotus_root', 'Lotus Root (Kamal Kakdi)', 'Lotus Root | தாமரை வேர் | कमल ककड़ी', 'vegetable', '🪷', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Gut-Health', 'Immune-Boost', 'Traditional'],
    { calories: 74, protein_g: 2.6, carbs_g: 17.2, fat_g: 0.1, fiber_g: 4.9, sugar_g: 0.5, sodium_mg: 45, iron_mg: 0.9, calcium_mg: 45, magnesium_mg: 23, zinc_mg: 0.3, potassium_mg: 556, phosphorus_mg: 100, vitamin_c_mg: 44, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 13, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 35 },
    'High in dietary fiber and Vitamin C. Used in Kashmiri and North Indian cuisines. Rich in resistant starch.'),

  food('curry_leaves', 'Curry Leaves (Kadi Patta)', 'Curry Leaves | கறிவேப்பிலை | करी पत्ता', 'spice', '🍃', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'Detox', 'Traditional', 'Sattvic'],
    { calories: 108, protein_g: 6.1, carbs_g: 18.7, fat_g: 1, fiber_g: 6.4, sugar_g: 0, sodium_mg: 11, iron_mg: 7.0, calcium_mg: 830, magnesium_mg: 44, zinc_mg: 0.2, potassium_mg: 0, phosphorus_mg: 57, vitamin_c_mg: 4, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 93, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 20 },
    'Exceptional iron (7mg) and calcium (830mg) per 100g — used as a daily flavoring in South India. Mahanimbine has anti-cancer properties.'),

  food('banana_flower', 'Banana Flower (Vazhai Poo)', 'Banana Flower | வாழைப்பூ | केले का फूल', 'vegetable', '🌸', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'PCOD-Friendly', 'Diabetic-Friendly', 'Traditional'],
    { calories: 43, protein_g: 1.6, carbs_g: 9.9, fat_g: 0.6, fiber_g: 5.7, sugar_g: 0, sodium_mg: 56, iron_mg: 1.6, calcium_mg: 56, magnesium_mg: 48, zinc_mg: 0.6, potassium_mg: 553, phosphorus_mg: 73, vitamin_c_mg: 13, vitamin_a_mcg: 10, vitamin_d_mcg: 0, folate_mcg: 25, selenium_mcg: 1.1, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 35 },
    'Medicinal food used in Ayurveda for PCOD and menstrual regulation. Rich in iron and fiber.'),

  food('ash_gourd', 'Ash Gourd (White Pumpkin)', 'Ash Gourd | வெண்பூசணிக்காய் | पेठा', 'vegetable', '🥬', 'any', ['vegetarian', 'vegan'],
    ['Low-GI', 'Gut-Health', 'Detox', 'Hypertension-Safe', 'Ayurvedic'],
    { calories: 13, protein_g: 0.4, carbs_g: 3, fat_g: 0.2, fiber_g: 2.9, sugar_g: 1.2, sodium_mg: 111, iron_mg: 0.3, calcium_mg: 19, magnesium_mg: 10, zinc_mg: 0.4, potassium_mg: 6, phosphorus_mg: 19, vitamin_c_mg: 13, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 5, selenium_mcg: 0.2, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 30 },
    'Extremely low calorie. Used in Ayurvedic medicine for nervous system, digestive health, and de-addiction.'),

  food('colocasia', 'Colocasia / Arbi (Taro)', 'Taro | சேம்பு | अरबी', 'vegetable', '🥔', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Energy-Dense', 'Gut-Health'],
    { calories: 142, protein_g: 0.5, carbs_g: 34.6, fat_g: 0.2, fiber_g: 4.1, sugar_g: 0.5, sodium_mg: 11, iron_mg: 0.6, calcium_mg: 43, magnesium_mg: 33, zinc_mg: 0.2, potassium_mg: 591, phosphorus_mg: 84, vitamin_c_mg: 4.5, vitamin_a_mcg: 4, vitamin_d_mcg: 0, folate_mcg: 19, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.06, dha_mg: 0, glycemic_index: 54 },
    'Rich in galactans — a unique prebiotic fiber. Used across South and West India.'),

  food('ridge_gourd', 'Ridge Gourd (Turai)', 'Ridge Gourd | பீர்க்கை | तोरई', 'vegetable', '🥒', 'any', ['vegetarian', 'vegan'],
    ['Low-GI', 'Diabetic-Friendly', 'Gut-Health', 'Detox'],
    { calories: 20, protein_g: 1.2, carbs_g: 4.4, fat_g: 0.2, fiber_g: 0.5, sugar_g: 2.2, sodium_mg: 3, iron_mg: 0.4, calcium_mg: 18, magnesium_mg: 14, zinc_mg: 0.1, potassium_mg: 139, phosphorus_mg: 28, vitamin_c_mg: 12, vitamin_a_mcg: 4, vitamin_d_mcg: 0, folate_mcg: 7, selenium_mcg: 0.2, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 25 },
    'Very low calorie. Traditionally used in Ayurveda to reduce bile secretion and improve liver function.'),

  food('purple_yam', 'Purple Yam (Kand)', 'Purple Yam | சேனைக்கிழங்கு | रतालू', 'vegetable', '🟣', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Anti-Inflammatory', 'Energy-Dense', 'Traditional'],
    { calories: 118, protein_g: 1.5, carbs_g: 27, fat_g: 0.1, fiber_g: 4.1, sugar_g: 0.5, sodium_mg: 9, iron_mg: 0.7, calcium_mg: 17, magnesium_mg: 21, zinc_mg: 0.2, potassium_mg: 816, phosphorus_mg: 49, vitamin_c_mg: 17, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 23, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.11, dha_mg: 0, glycemic_index: 51 },
    'Rich in anthocyanins (purple pigment) which are powerful antioxidants. Traditional festive food in Maharashtra and Goa.'),
]

// ─── LEGUMES ──────────────────────────────────────────────────────────────────

const legumes = [
  food('kala_chana', 'Black Chickpeas (Kala Chana, cooked)', 'Kala Chana | கருப்பு கொண்டைக்கடலை | काला चना', 'legume', '🟤', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'High-Fiber', 'Low-GI', 'Diabetic-Friendly', 'PCOD-Friendly'],
    { calories: 164, protein_g: 9, carbs_g: 27.4, fat_g: 2.6, fiber_g: 7.6, sugar_g: 4.8, sodium_mg: 7, iron_mg: 2.9, calcium_mg: 49, magnesium_mg: 48, zinc_mg: 1.5, potassium_mg: 291, phosphorus_mg: 168, vitamin_c_mg: 1.3, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 172, selenium_mcg: 3.7, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 28 },
    'Superior to kabuli chana in protein and iron. Rich in resistant starch and folate. Traditional high-protein food across India.'),

  food('kabuli_chana', 'White Chickpeas (Kabuli Chana, cooked)', 'Chickpeas | வெள்ளை கொண்டைக்கடலை | काबुली चना', 'legume', '🤍', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'High-Fiber', 'Folate-Rich', 'Low-GI'],
    { calories: 164, protein_g: 8.9, carbs_g: 27.4, fat_g: 2.6, fiber_g: 7.6, sugar_g: 4.8, sodium_mg: 7, iron_mg: 2.9, calcium_mg: 49, magnesium_mg: 48, zinc_mg: 1.5, potassium_mg: 291, phosphorus_mg: 168, vitamin_c_mg: 1.3, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 172, selenium_mcg: 3.7, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 28 },
    'Complete plant protein with all essential amino acids. High in folate and resistant starch. Low GI — excellent for diabetes.'),

  food('moong_dal', 'Moong Dal (cooked)', 'Moong Dal | பாசி பருப்பு | मूंग दाल', 'legume', '💛', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Folate-Rich', 'Gut-Health', 'Low-GI', 'Diabetic-Friendly'],
    { calories: 105, protein_g: 7, carbs_g: 19.1, fat_g: 0.4, fiber_g: 7.6, sugar_g: 2, sodium_mg: 15, iron_mg: 1.4, calcium_mg: 27, magnesium_mg: 36, zinc_mg: 0.8, potassium_mg: 369, phosphorus_mg: 99, vitamin_c_mg: 1, vitamin_a_mcg: 11, vitamin_d_mcg: 0, folate_mcg: 159, selenium_mcg: 2.5, iodine_mcg: 0, omega3_g: 0.06, dha_mg: 0, glycemic_index: 32 },
    'Lightest and most easily digestible dal. High in folate and protein. Prescribed for sick, pregnant, and elderly.'),

  food('toor_dal', 'Toor Dal / Arhar Dal (cooked)', 'Toor Dal | துவரம் பருப்பு | तुअर दाल', 'legume', '🟡', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'Traditional', 'Sattvic'],
    { calories: 116, protein_g: 7, carbs_g: 20.6, fat_g: 0.4, fiber_g: 6.7, sugar_g: 0, sodium_mg: 7, iron_mg: 1.9, calcium_mg: 43, magnesium_mg: 41, zinc_mg: 0.9, potassium_mg: 358, phosphorus_mg: 149, vitamin_c_mg: 1.5, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 456, selenium_mcg: 8.2, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 29 },
    'Highest folate content among dals (456mcg). Base of South Indian sambar. Excellent source of selenium.'),

  food('masoor_dal', 'Masoor Dal / Red Lentils (cooked)', 'Masoor Dal | செம்பருப்பு | मसूर दाल', 'legume', '🔴', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'High-Fiber', 'PCOD-Friendly'],
    { calories: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4, fiber_g: 7.9, sugar_g: 1.8, sodium_mg: 2, iron_mg: 3.3, calcium_mg: 19, magnesium_mg: 36, zinc_mg: 1.3, potassium_mg: 369, phosphorus_mg: 180, vitamin_c_mg: 1.5, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 181, selenium_mcg: 2.8, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 21 },
    'Highest iron among common dals (3.3mg/100g cooked). Cooks quickly. Ideal for anemia and PCOD management.'),

  food('urad_dal', 'Urad Dal Whole (cooked)', 'Urad Dal | உளுத்தம் பருப்பு | उड़द दाल', 'legume', '⚫', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Calcium-Rich', 'Folate-Rich', 'Traditional'],
    { calories: 127, protein_g: 8.9, carbs_g: 22.9, fat_g: 0.6, fiber_g: 3.3, sugar_g: 0, sodium_mg: 8, iron_mg: 3.8, calcium_mg: 138, magnesium_mg: 78, zinc_mg: 1.7, potassium_mg: 369, phosphorus_mg: 189, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 216, selenium_mcg: 1.5, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 43 },
    'Used for idli/dosa batter fermentation. Very high in calcium (138mg) and iron (3.8mg). Rich in B vitamins.'),

  food('rajma', 'Rajma / Kidney Beans (cooked)', 'Rajma | ராஜ்மா | राजमा', 'legume', '🫘', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'High-Fiber', 'Heart-Healthy'],
    { calories: 127, protein_g: 8.7, carbs_g: 22.8, fat_g: 0.5, fiber_g: 7.4, sugar_g: 0.3, sodium_mg: 2, iron_mg: 2.9, calcium_mg: 50, magnesium_mg: 45, zinc_mg: 1.4, potassium_mg: 403, phosphorus_mg: 244, vitamin_c_mg: 1.4, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 130, selenium_mcg: 3.2, iodine_mcg: 0, omega3_g: 0.28, dha_mg: 0, glycemic_index: 24 },
    'Rich in resistant starch and soluble fiber that lower cholesterol. High in folate and iron. Punjab staple.'),

  food('horsegram', 'Horse Gram (Kulthi, cooked)', 'Horse Gram | கொள்ளு | कुलथी', 'legume', '🟤', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Weight-Loss', 'Diabetic-Friendly', 'Detox'],
    { calories: 321, protein_g: 22, carbs_g: 57.2, fat_g: 0.5, fiber_g: 5.3, sugar_g: 0, sodium_mg: 0, iron_mg: 7.0, calcium_mg: 287, magnesium_mg: 0, zinc_mg: 2.6, potassium_mg: 0, phosphorus_mg: 311, vitamin_c_mg: 3, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 29 },
    'Extremely high protein (22g) and iron (7mg dry). Traditional Ayurvedic remedy for kidney stones. Used in kollu rasam.'),

  food('lobia', 'Lobia / Black-Eyed Peas (cooked)', 'Lobia | தட்டைப்பயறு | लोबिया', 'legume', '⚪', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'Gut-Health'],
    { calories: 116, protein_g: 7.7, carbs_g: 20.8, fat_g: 0.5, fiber_g: 6.5, sugar_g: 3.3, sodium_mg: 4, iron_mg: 2.5, calcium_mg: 24, magnesium_mg: 53, zinc_mg: 1.3, potassium_mg: 278, phosphorus_mg: 156, vitamin_c_mg: 0.2, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 208, selenium_mcg: 5.5, iodine_mcg: 0, omega3_g: 0.07, dha_mg: 0, glycemic_index: 33 },
    'High in folate and iron. Excellent prebiotic fiber. Used across India and West Africa.'),

  food('sprouted_moong', 'Sprouted Green Moong', 'Sprouted Moong | முளைகட்டிய பாசி | अंकुरित मूंग', 'legume', '🌱', 'snack', ['vegetarian', 'vegan'],
    ['High-Protein', 'Folate-Rich', 'Gut-Health', 'Immune-Boost', 'Low-GI'],
    { calories: 30, protein_g: 3.1, carbs_g: 5.9, fat_g: 0.2, fiber_g: 1.8, sugar_g: 0, sodium_mg: 6, iron_mg: 0.9, calcium_mg: 13, magnesium_mg: 21, zinc_mg: 0.4, potassium_mg: 149, phosphorus_mg: 54, vitamin_c_mg: 13.2, vitamin_a_mcg: 2, vitamin_d_mcg: 0, folate_mcg: 61, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 25 },
    'Sprouting increases Vitamin C by 6× and reduces phytate by 50%. Perfect raw snack or salad base.'),

  food('soybean', 'Soybean (boiled)', 'Soybean | சோயா | सोयाबीन', 'legume', '🟡', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Calcium-Rich', 'Iron-Rich', 'Omega-3-Rich', 'Muscle-Building'],
    { calories: 173, protein_g: 16.6, carbs_g: 9.9, fat_g: 9, fiber_g: 6, sugar_g: 3, sodium_mg: 1, iron_mg: 3.6, calcium_mg: 102, magnesium_mg: 86, zinc_mg: 1.2, potassium_mg: 515, phosphorus_mg: 245, vitamin_c_mg: 1.7, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 54, selenium_mcg: 7.3, iodine_mcg: 0, omega3_g: 0.6, dha_mg: 0, glycemic_index: 15 },
    'Highest protein plant food. Contains isoflavones that modulate estrogen — beneficial for PCOD and menopause.'),

  food('matki', 'Matki / Moth Beans (cooked)', 'Moth Beans | மொச்சை | मटकी', 'legume', '🟤', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'Traditional'],
    { calories: 343, protein_g: 23, carbs_g: 61.5, fat_g: 1.6, fiber_g: 4.5, sugar_g: 0, sodium_mg: 32, iron_mg: 8.0, calcium_mg: 202, magnesium_mg: 160, zinc_mg: 2.7, potassium_mg: 1070, phosphorus_mg: 414, vitamin_c_mg: 4, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 27 },
    'Exceptionally high iron (8mg dry) and protein (23g). Maharashtra staple. Used in usal and misal.'),

  food('yellow_moong', 'Yellow Moong Dal (cooked)', 'Yellow Moong | பாசி பருப்பு | पीली मूंग दाल', 'legume', '💛', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Gut-Health', 'Low-GI', 'Sattvic', 'Traditional'],
    { calories: 104, protein_g: 7.2, carbs_g: 18.4, fat_g: 0.4, fiber_g: 2.1, sugar_g: 2, sodium_mg: 2, iron_mg: 1.4, calcium_mg: 27, magnesium_mg: 36, zinc_mg: 0.8, potassium_mg: 369, phosphorus_mg: 99, vitamin_c_mg: 1, vitamin_a_mcg: 11, vitamin_d_mcg: 0, folate_mcg: 159, selenium_mcg: 2.5, iodine_mcg: 0, omega3_g: 0.06, dha_mg: 0, glycemic_index: 32 },
    'Easiest to digest. Sattvic food in Ayurveda. Base of khichdi — the classic recovery and detox meal.'),
]

// ─── NUTS & SEEDS ─────────────────────────────────────────────────────────────

const nuts_seeds = [
  food('peanuts', 'Peanuts / Groundnuts (roasted)', 'Peanuts | வேர்க்கடலை | मूंगफली', 'nut_seed', '🥜', 'snack', ['vegetarian', 'vegan'],
    ['High-Protein', 'Muscle-Building', 'Energy-Dense', 'Magnesium-Rich'],
    { calories: 567, protein_g: 25.8, carbs_g: 16.1, fat_g: 49.2, fiber_g: 8.5, sugar_g: 4, sodium_mg: 18, iron_mg: 2, calcium_mg: 92, magnesium_mg: 168, zinc_mg: 3.3, potassium_mg: 705, phosphorus_mg: 376, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 240, selenium_mcg: 7.2, iodine_mcg: 0, omega3_g: 0.003, dha_mg: 0, glycemic_index: 14 },
    'Cheapest high-protein food in India. Rich in niacin (B3) and folate. Low GI — ideal post-workout snack.'),

  food('sesame', 'Sesame Seeds (Til)', 'Sesame | எள் | तिल', 'nut_seed', '🌾', 'any', ['vegetarian', 'vegan'],
    ['Calcium-Rich', 'Iron-Rich', 'Bone-Health', 'Magnesium-Rich', 'Zinc-Rich'],
    { calories: 573, protein_g: 17.7, carbs_g: 23.5, fat_g: 49.7, fiber_g: 11.8, sugar_g: 0.3, sodium_mg: 11, iron_mg: 14.6, calcium_mg: 975, magnesium_mg: 351, zinc_mg: 7.8, potassium_mg: 468, phosphorus_mg: 629, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 97, selenium_mcg: 34.4, iodine_mcg: 0, omega3_g: 0.38, dha_mg: 0, glycemic_index: 35 },
    'Highest calcium food after dairy (975mg/100g). Exceptional iron (14.6mg) and selenium (34mcg). Used in til chutney, laddu.'),

  food('flaxseed', 'Flaxseed / Alsi', 'Flaxseed | ஆளி விதை | अलसी', 'nut_seed', '🟤', 'any', ['vegetarian', 'vegan'],
    ['Omega-3-Rich', 'High-Fiber', 'Heart-Healthy', 'PCOD-Friendly', 'Anti-Inflammatory'],
    { calories: 534, protein_g: 18.3, carbs_g: 28.9, fat_g: 42.2, fiber_g: 27.3, sugar_g: 1.6, sodium_mg: 30, iron_mg: 5.7, calcium_mg: 255, magnesium_mg: 392, zinc_mg: 4.3, potassium_mg: 813, phosphorus_mg: 642, vitamin_c_mg: 0.6, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 87, selenium_mcg: 25.4, iodine_mcg: 0, omega3_g: 22.8, dha_mg: 0, glycemic_index: 35 },
    'Richest plant source of Omega-3 ALA (22.8g/100g). High lignan content balances estrogen — excellent for PCOD.'),

  food('pumpkin_seeds', 'Pumpkin Seeds (Kaddu ke Beej)', 'Pumpkin Seeds | மத்தன் விதை | कद्दू के बीज', 'nut_seed', '🌱', 'snack', ['vegetarian', 'vegan'],
    ['High-Protein', 'Zinc-Rich', 'Magnesium-Rich', 'Iron-Rich', 'PCOD-Friendly', 'Immune-Boost'],
    { calories: 559, protein_g: 30.2, carbs_g: 10.7, fat_g: 49, fiber_g: 6, sugar_g: 1.4, sodium_mg: 7, iron_mg: 8.8, calcium_mg: 46, magnesium_mg: 592, zinc_mg: 7.8, potassium_mg: 809, phosphorus_mg: 1233, vitamin_c_mg: 1.9, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 57, selenium_mcg: 9.4, iodine_mcg: 0, omega3_g: 0.12, dha_mg: 0, glycemic_index: 25 },
    'Highest plant zinc source (7.8mg) and magnesium (592mg). 30g protein per 100g. Essential for PCOD hormone balance.'),

  food('sunflower_seeds', 'Sunflower Seeds', 'Sunflower Seeds | சூரியகாந்தி விதை | सूरजमुखी के बीज', 'nut_seed', '🌻', 'snack', ['vegetarian', 'vegan'],
    ['Magnesium-Rich', 'Folate-Rich', 'Selenium-Rich', 'Heart-Healthy'],
    { calories: 584, protein_g: 20.8, carbs_g: 20, fat_g: 51.5, fiber_g: 8.6, sugar_g: 2.6, sodium_mg: 9, iron_mg: 5.3, calcium_mg: 78, magnesium_mg: 325, zinc_mg: 5, potassium_mg: 645, phosphorus_mg: 660, vitamin_c_mg: 1.4, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 227, selenium_mcg: 53, iodine_mcg: 0, omega3_g: 0.07, dha_mg: 0, glycemic_index: 35 },
    'Highest Vitamin E content (35mg/100g). Rich in selenium (53mcg) — important for thyroid and antioxidant defense.'),

  food('almonds', 'Almonds', 'Almonds | பாதாம் | बादाम', 'nut_seed', '🫘', 'snack', ['vegetarian', 'vegan'],
    ['Magnesium-Rich', 'Bone-Health', 'Calcium-Rich', 'Heart-Healthy', 'Brain-Health'],
    { calories: 579, protein_g: 21.2, carbs_g: 21.6, fat_g: 49.9, fiber_g: 12.5, sugar_g: 4.4, sodium_mg: 1, iron_mg: 3.7, calcium_mg: 264, magnesium_mg: 270, zinc_mg: 3.1, potassium_mg: 733, phosphorus_mg: 481, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 44, selenium_mcg: 4.1, iodine_mcg: 0, omega3_g: 0.003, dha_mg: 0, glycemic_index: 0 },
    'High in calcium (264mg), magnesium, and Vitamin E. Soaking overnight removes tannins and improves nutrient absorption.'),

  food('walnuts', 'Walnuts', 'Walnuts | அக்ரூட் | अखरोट', 'nut_seed', '🫘', 'snack', ['vegetarian', 'vegan'],
    ['Omega-3-Rich', 'Brain-Health', 'Heart-Healthy', 'Anti-Inflammatory', 'PCOD-Friendly'],
    { calories: 654, protein_g: 15.2, carbs_g: 13.7, fat_g: 65.2, fiber_g: 6.7, sugar_g: 2.6, sodium_mg: 2, iron_mg: 2.9, calcium_mg: 98, magnesium_mg: 158, zinc_mg: 3.1, potassium_mg: 441, phosphorus_mg: 346, vitamin_c_mg: 1.3, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 98, selenium_mcg: 4.9, iodine_mcg: 0, omega3_g: 9.1, dha_mg: 0, glycemic_index: 15 },
    'Richest plant source of omega-3 after flaxseed (9.1g ALA). Brain-shaped — used traditionally for cognitive health.'),

  food('chia_seeds', 'Chia Seeds', 'Chia Seeds | சியா விதை | चिया बीज', 'nut_seed', '⚫', 'any', ['vegetarian', 'vegan'],
    ['Omega-3-Rich', 'Calcium-Rich', 'High-Fiber', 'Heart-Healthy', 'Diabetic-Friendly', 'Weight-Loss'],
    { calories: 486, protein_g: 16.5, carbs_g: 42.1, fat_g: 30.7, fiber_g: 34.4, sugar_g: 0, sodium_mg: 16, iron_mg: 7.7, calcium_mg: 631, magnesium_mg: 335, zinc_mg: 4.6, potassium_mg: 407, phosphorus_mg: 860, vitamin_c_mg: 1.6, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 49, selenium_mcg: 55.2, iodine_mcg: 0, omega3_g: 17.8, dha_mg: 0, glycemic_index: 1 },
    'Highest fiber (34.4g) of any food. Exceptional calcium (631mg) and omega-3 (17.8g). Forms gel that slows glucose absorption.'),

  food('foxnuts', 'Foxnuts / Makhana', 'Foxnuts | மகான | मखाना', 'nut_seed', '⚪', 'snack', ['vegetarian', 'vegan'],
    ['Low-Fat', 'Weight-Loss', 'Calcium-Rich', 'Sattvic', 'Gut-Health'],
    { calories: 347, protein_g: 9.7, carbs_g: 76.9, fat_g: 0.1, fiber_g: 14.5, sugar_g: 0, sodium_mg: 0, iron_mg: 1.4, calcium_mg: 60, magnesium_mg: 67, zinc_mg: 0.5, potassium_mg: 500, phosphorus_mg: 0, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 65 },
    'Low fat, high fiber snack. Sattvic food used in Hindu fasting. Processed by lotus plant. Rich in resistant starch.'),

  food('hemp_seeds', 'Hemp Seeds', 'Hemp Seeds | சணல் விதை | भांग बीज', 'nut_seed', '🌿', 'any', ['vegetarian', 'vegan'],
    ['High-Protein', 'Omega-3-Rich', 'Magnesium-Rich', 'Heart-Healthy', 'PCOD-Friendly'],
    { calories: 553, protein_g: 31.6, carbs_g: 8.7, fat_g: 48.8, fiber_g: 4, sugar_g: 1.5, sodium_mg: 5, iron_mg: 7.95, calcium_mg: 70, magnesium_mg: 700, zinc_mg: 9.9, potassium_mg: 1200, phosphorus_mg: 1650, vitamin_c_mg: 1, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 110, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 9.3, dha_mg: 0, glycemic_index: 15 },
    'Complete protein with optimal omega-6:omega-3 ratio (3:1). Exceptional magnesium (700mg). Legal variety — no psychoactive compounds.'),

  food('watermelon_seeds', 'Watermelon Seeds (roasted)', 'Watermelon Seeds | தர்பூசணி விதை | तरबूज के बीज', 'nut_seed', '🌑', 'snack', ['vegetarian', 'vegan'],
    ['High-Protein', 'Magnesium-Rich', 'Zinc-Rich', 'Immune-Boost'],
    { calories: 557, protein_g: 28.3, carbs_g: 15.3, fat_g: 47.4, fiber_g: 0, sugar_g: 3.4, sodium_mg: 99, iron_mg: 7.3, calcium_mg: 54, magnesium_mg: 556, zinc_mg: 10.2, potassium_mg: 648, phosphorus_mg: 755, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 58, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 0 },
    'Excellent protein source (28g). High in zinc (10.2mg) which supports immunity and male reproductive health.'),

  food('cashews', 'Cashew Nuts', 'Cashews | முந்திரிப் பருப்பு | काजू', 'nut_seed', '🌙', 'snack', ['vegetarian', 'vegan'],
    ['Magnesium-Rich', 'Zinc-Rich', 'Iron-Rich', 'Energy-Dense'],
    { calories: 553, protein_g: 18.2, carbs_g: 30.2, fat_g: 43.9, fiber_g: 3.3, sugar_g: 5.9, sodium_mg: 12, iron_mg: 6.7, calcium_mg: 37, magnesium_mg: 292, zinc_mg: 5.6, potassium_mg: 660, phosphorus_mg: 593, vitamin_c_mg: 0.5, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 25, selenium_mcg: 19.9, iodine_mcg: 0, omega3_g: 0.16, dha_mg: 0, glycemic_index: 25 },
    'High magnesium and zinc. Monounsaturated fats (oleic acid) similar to olive oil. Lower fat than most nuts.'),
]

// ─── FERMENTED FOODS ──────────────────────────────────────────────────────────

const fermented = [
  food('idli', 'Idli (steamed, 1 piece ~50g)', 'Idli | இட்லி | इडली', 'fermented', '⚪', 'breakfast', ['vegetarian', 'vegan'],
    ['Gut-Health', 'Probiotic', 'Low-Fat', 'Sattvic', 'Traditional'],
    { calories: 58, protein_g: 1.9, carbs_g: 12.1, fat_g: 0.3, fiber_g: 0.3, sugar_g: 0.2, sodium_mg: 180, iron_mg: 0.4, calcium_mg: 11, magnesium_mg: 10, zinc_mg: 0.3, potassium_mg: 73, phosphorus_mg: 36, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0.1, folate_mcg: 12, selenium_mcg: 3.5, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 35 },
    'Fermented rice-lentil steamed cake. Probiotic-rich, easily digestible, low fat. Highest bioavailable protein in Indian breakfast foods.'),

  food('dahi', 'Curd / Dahi (plain)', 'Curd | தயிர் | दही', 'fermented', '🥛', 'any', ['vegetarian'],
    ['Probiotic', 'Calcium-Rich', 'Gut-Health', 'Bone-Health', 'PCOD-Friendly'],
    { calories: 98, protein_g: 3.5, carbs_g: 3.4, fat_g: 4.3, fiber_g: 0, sugar_g: 3.4, sodium_mg: 46, iron_mg: 0.1, calcium_mg: 110, magnesium_mg: 11, zinc_mg: 0.5, potassium_mg: 155, phosphorus_mg: 95, vitamin_c_mg: 0, vitamin_a_mcg: 28, vitamin_d_mcg: 0.1, folate_mcg: 11, selenium_mcg: 3.3, iodine_mcg: 6, omega3_g: 0.05, dha_mg: 0, glycemic_index: 36 },
    'Live cultures of Lactobacillus. Highest calcium bioavailability. Improves gut microbiome diversity.'),

  food('buttermilk', 'Buttermilk / Chaas (thin)', 'Buttermilk | மோர் | छाछ', 'fermented', '🥛', 'any', ['vegetarian'],
    ['Probiotic', 'Gut-Health', 'Hypertension-Safe', 'Detox', 'Low-Fat'],
    { calories: 40, protein_g: 3.3, carbs_g: 4.8, fat_g: 0.9, fiber_g: 0, sugar_g: 4.8, sodium_mg: 105, iron_mg: 0.1, calcium_mg: 116, magnesium_mg: 11, zinc_mg: 0.4, potassium_mg: 151, phosphorus_mg: 85, vitamin_c_mg: 0, vitamin_a_mcg: 14, vitamin_d_mcg: 0, folate_mcg: 5, selenium_mcg: 3.3, iodine_mcg: 6, omega3_g: 0.02, dha_mg: 0, glycemic_index: 30 },
    'Probiotic drink with live cultures. Low calorie, high calcium. Traditional post-meal digestive aid across India.'),

  food('fermented_rice', 'Fermented Rice (Pazhaya Sadam)', 'Fermented Rice | பழைய சாதம் | बासी भात', 'fermented', '🍚', 'breakfast', ['vegetarian', 'vegan'],
    ['Probiotic', 'Gut-Health', 'Low-GI', 'Brain-Health', 'Traditional'],
    { calories: 62, protein_g: 2.3, carbs_g: 13.1, fat_g: 0.1, fiber_g: 0.4, sugar_g: 0, sodium_mg: 5, iron_mg: 0.4, calcium_mg: 10, magnesium_mg: 11, zinc_mg: 0.4, potassium_mg: 60, phosphorus_mg: 50, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0.3, folate_mcg: 4, selenium_mcg: 5, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 32 },
    'Overnight fermented cooked rice with water. Microbiome research shows trillions of beneficial bacteria. Traditional Tamil and Odia breakfast.'),

  food('kanji', 'Kanji (Rice Ferment Gruel)', 'Kanji | கஞ்சி | कांजी', 'fermented', '🍵', 'breakfast', ['vegetarian', 'vegan'],
    ['Probiotic', 'Gut-Health', 'Low-GI', 'Detox', 'Traditional'],
    { calories: 31, protein_g: 0.7, carbs_g: 6.8, fat_g: 0.1, fiber_g: 0.2, sugar_g: 0, sodium_mg: 3, iron_mg: 0.1, calcium_mg: 5, magnesium_mg: 5, zinc_mg: 0.1, potassium_mg: 30, phosphorus_mg: 20, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 2, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 28 },
    'Very low calorie, easily digestible. Traditional medicine food for gut healing, dehydration, and post-illness recovery.'),

  food('ambali', 'Ambali / Fermented Ragi Porridge', 'Ambali | கேழ்வரகு களி | अंबाली', 'fermented', '🟤', 'breakfast', ['vegetarian', 'vegan'],
    ['Probiotic', 'Calcium-Rich', 'Iron-Rich', 'Gut-Health', 'Diabetic-Friendly', 'Traditional'],
    { calories: 85, protein_g: 2.8, carbs_g: 18, fat_g: 0.5, fiber_g: 3, sugar_g: 0, sodium_mg: 10, iron_mg: 1.4, calcium_mg: 100, magnesium_mg: 37, zinc_mg: 0.4, potassium_mg: 120, phosphorus_mg: 70, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 15, selenium_mcg: 2, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 55 },
    'Fermented ragi porridge. Fermentation increases calcium bioavailability and produces B vitamins. Traditional breakfast in Karnataka.'),

  food('dosa', 'Plain Dosa', 'Dosa | தோசை | डोसा', 'fermented', '🫓', 'breakfast', ['vegetarian', 'vegan'],
    ['Probiotic', 'Gut-Health', 'Low-Fat', 'Traditional', 'Sattvic'],
    { calories: 168, protein_g: 4.4, carbs_g: 31.5, fat_g: 3.3, fiber_g: 0.8, sugar_g: 0.5, sodium_mg: 380, iron_mg: 0.8, calcium_mg: 16, magnesium_mg: 20, zinc_mg: 0.5, potassium_mg: 104, phosphorus_mg: 64, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 19, selenium_mcg: 6, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 52 },
    'Fermented rice-lentil crepe. Rich in probiotics. High carb energy food. Lower GI than plain roti.'),

  food('koozh', 'Koozh (Fermented Millet Porridge)', 'Koozh | கூழ் | कोझ', 'fermented', '🟤', 'breakfast', ['vegetarian', 'vegan'],
    ['Probiotic', 'Gut-Health', 'Iron-Rich', 'Traditional', 'Diabetic-Friendly'],
    { calories: 67, protein_g: 2.1, carbs_g: 14.5, fat_g: 0.3, fiber_g: 1.2, sugar_g: 0, sodium_mg: 8, iron_mg: 0.9, calcium_mg: 30, magnesium_mg: 20, zinc_mg: 0.3, potassium_mg: 80, phosphorus_mg: 60, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 10, selenium_mcg: 1.5, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 40 },
    'Traditional Tamil fermented millet drink/porridge. Field workers drank this for sustained energy. Rich in beneficial bacteria.'),
]

// ─── GRAINS ───────────────────────────────────────────────────────────────────

const grains = [
  food('brown_rice', 'Brown Rice (cooked)', 'Brown Rice | பழுப்பு அரிசி | भूरा चावल', 'grain', '🍚', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Low-GI', 'Diabetic-Friendly', 'Magnesium-Rich', 'Heart-Healthy'],
    { calories: 216, protein_g: 4.5, carbs_g: 44.8, fat_g: 1.8, fiber_g: 3.5, sugar_g: 0.7, sodium_mg: 10, iron_mg: 1.1, calcium_mg: 33, magnesium_mg: 84, zinc_mg: 1.2, potassium_mg: 154, phosphorus_mg: 150, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 15, selenium_mcg: 19.1, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 50 },
    'Whole grain with bran intact — retains fiber, magnesium, and B vitamins. Lower GI than white rice.'),

  food('ragi', 'Ragi / Finger Millet (flour, dry)', 'Ragi | ராகி | रागी', 'grain', '🟤', 'any', ['vegetarian', 'vegan'],
    ['Calcium-Rich', 'Iron-Rich', 'High-Fiber', 'Diabetic-Friendly', 'PCOD-Friendly', 'Bone-Health'],
    { calories: 336, protein_g: 7.3, carbs_g: 72.6, fat_g: 1.3, fiber_g: 3.6, sugar_g: 1.8, sodium_mg: 11, iron_mg: 3.9, calcium_mg: 344, magnesium_mg: 137, zinc_mg: 2.3, potassium_mg: 408, phosphorus_mg: 283, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 18, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 54 },
    'Highest calcium of all grains (344mg/100g). Exceptional iron (3.9mg). Gluten-free. Traditional food in Karnataka, Andhra, Tamil Nadu.'),

  food('bajra', 'Bajra / Pearl Millet (cooked)', 'Bajra | கம்பு | बाजरा', 'grain', '🟡', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Magnesium-Rich', 'High-Fiber', 'Diabetic-Friendly'],
    { calories: 97, protein_g: 3.5, carbs_g: 21.3, fat_g: 0.7, fiber_g: 1.3, sugar_g: 0, sodium_mg: 2, iron_mg: 0.9, calcium_mg: 14, magnesium_mg: 77, zinc_mg: 0.9, potassium_mg: 195, phosphorus_mg: 100, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 6, selenium_mcg: 2.7, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 54 },
    'Drought-resistant millet rich in iron and magnesium. Traditional in Rajasthan and Gujarat. Warmth-producing grain for winter.'),

  food('jowar', 'Jowar / Sorghum (cooked)', 'Jowar | சோளம் | ज्वार', 'grain', '🟡', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Diabetic-Friendly', 'High-Protein', 'Traditional'],
    { calories: 100, protein_g: 3.3, carbs_g: 22.3, fat_g: 0.3, fiber_g: 1.6, sugar_g: 0, sodium_mg: 2, iron_mg: 1.1, calcium_mg: 13, magnesium_mg: 53, zinc_mg: 0.7, potassium_mg: 363, phosphorus_mg: 287, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 55 },
    'Gluten-free whole grain. High antioxidant content. Used for bhakri in Maharashtra and Karnataka.'),

  food('foxtail_millet', 'Foxtail Millet (Thinai, cooked)', 'Foxtail Millet | தினை | कांगनी', 'grain', '🌾', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'High-Fiber', 'Diabetic-Friendly', 'Low-GI', 'Traditional'],
    { calories: 90, protein_g: 3.3, carbs_g: 19.6, fat_g: 0.5, fiber_g: 1.5, sugar_g: 0, sodium_mg: 4, iron_mg: 2.8, calcium_mg: 31, magnesium_mg: 81, zinc_mg: 1.5, potassium_mg: 195, phosphorus_mg: 188, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 50 },
    'Fastest-cooking millet. High iron (2.8mg) and B vitamins. Ancient grain used in Tamil Nadu and Andhra Pradesh.'),

  food('broken_wheat', 'Broken Wheat / Daliya (cooked)', 'Daliya | கோதுமை ரவை | दलिया', 'grain', '🌾', 'breakfast', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Magnesium-Rich', 'Gut-Health', 'Diabetic-Friendly'],
    { calories: 116, protein_g: 3.8, carbs_g: 24.3, fat_g: 0.5, fiber_g: 4.4, sugar_g: 0.4, sodium_mg: 9, iron_mg: 1.1, calcium_mg: 11, magnesium_mg: 32, zinc_mg: 0.7, potassium_mg: 100, phosphorus_mg: 72, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 14, selenium_mcg: 14.1, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 41 },
    'High-fiber breakfast food. Lower GI than semolina. Used as wheat porridge across North India.'),

  food('little_millet', 'Little Millet (Samai, cooked)', 'Little Millet | சாமை | छोटी कांगनी', 'grain', '🌾', 'any', ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Diabetic-Friendly', 'Low-GI', 'Traditional'],
    { calories: 207, protein_g: 7.7, carbs_g: 41.4, fat_g: 4.7, fiber_g: 7.6, sugar_g: 0, sodium_mg: 5, iron_mg: 9.3, calcium_mg: 17, magnesium_mg: 0, zinc_mg: 0, potassium_mg: 0, phosphorus_mg: 220, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 52 },
    'Highest iron among millets (9.3mg dry). Used in Tamil Nadu fasting foods. Gluten-free, easily digestible.'),

  food('red_rice', 'Red Rice (Kerala Matta, cooked)', 'Red Rice | சிவப்பு அரிசி | लाल चावल', 'grain', '🔴', 'any', ['vegetarian', 'vegan'],
    ['High-Fiber', 'Iron-Rich', 'Anti-Inflammatory', 'Traditional', 'Diabetic-Friendly'],
    { calories: 210, protein_g: 4.6, carbs_g: 43.2, fat_g: 1.8, fiber_g: 4.2, sugar_g: 0, sodium_mg: 7, iron_mg: 1.8, calcium_mg: 20, magnesium_mg: 43, zinc_mg: 0.8, potassium_mg: 80, phosphorus_mg: 100, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 12, selenium_mcg: 10, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 52 },
    'Red pigment from anthocyanins. Higher fiber and iron than white rice. Traditional Kerala staple. Stronger prebiotic effect.'),
]

// ─── DAIRY ────────────────────────────────────────────────────────────────────

const dairy = [
  food('paneer', 'Paneer / Cottage Cheese', 'Paneer | பன்னீர் | पनीर', 'dairy', '🧀', 'any', ['vegetarian'],
    ['High-Protein', 'Calcium-Rich', 'Muscle-Building', 'Bone-Health'],
    { calories: 265, protein_g: 20.8, carbs_g: 1.2, fat_g: 20.8, fiber_g: 0, sugar_g: 1.2, sodium_mg: 10, iron_mg: 0.2, calcium_mg: 480, magnesium_mg: 11, zinc_mg: 1.6, potassium_mg: 64, phosphorus_mg: 508, vitamin_c_mg: 0, vitamin_a_mcg: 228, vitamin_d_mcg: 0.3, folate_mcg: 37, selenium_mcg: 14.5, iodine_mcg: 12, omega3_g: 0.3, dha_mg: 0, glycemic_index: 0 },
    'Highest calcium food after sesame in Indian diet. Complete protein with all essential amino acids. No carbohydrates — ideal for keto and low-carb.'),

  food('ghee', 'Ghee (Clarified Butter)', 'Ghee | நெய் | घी', 'dairy', '🟡', 'any', ['vegetarian'],
    ['Energy-Dense', 'Sattvic', 'Traditional', 'Brain-Health'],
    { calories: 900, protein_g: 0, carbs_g: 0, fat_g: 99.8, fiber_g: 0, sugar_g: 0, sodium_mg: 2, iron_mg: 0, calcium_mg: 0, magnesium_mg: 0, zinc_mg: 0.1, potassium_mg: 5, phosphorus_mg: 3, vitamin_c_mg: 0, vitamin_a_mcg: 840, vitamin_d_mcg: 1.5, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0.45, dha_mg: 0, glycemic_index: 0 },
    'Rich in butyrate (gut barrier protection), fat-soluble vitamins A, D, E, K. Activates fat-soluble vitamin absorption in every meal.'),

  food('cow_milk', 'Cow Milk (whole)', 'Cow Milk | பசும்பால் | गाय का दूध', 'dairy', '🥛', 'any', ['vegetarian'],
    ['Calcium-Rich', 'Bone-Health', 'High-Protein', 'Muscle-Building'],
    { calories: 61, protein_g: 3.2, carbs_g: 4.8, fat_g: 3.3, fiber_g: 0, sugar_g: 4.8, sodium_mg: 43, iron_mg: 0, calcium_mg: 113, magnesium_mg: 10, zinc_mg: 0.4, potassium_mg: 132, phosphorus_mg: 84, vitamin_c_mg: 0, vitamin_a_mcg: 46, vitamin_d_mcg: 0.1, folate_mcg: 5, selenium_mcg: 3.7, iodine_mcg: 56, omega3_g: 0.08, dha_mg: 5, glycemic_index: 31 },
    'Complete nutrition with calcium, protein, iodine, and B12. Iodine content makes it important for thyroid health.'),

  food('paneer_low_fat', 'Low-Fat Curd (skimmed)', 'Low-fat Curd | குறைந்த கொழுப்பு தயிர் | कम वसा दही', 'dairy', '🥛', 'any', ['vegetarian'],
    ['Probiotic', 'Calcium-Rich', 'Gut-Health', 'Weight-Loss', 'Low-Fat'],
    { calories: 56, protein_g: 5.7, carbs_g: 6.1, fat_g: 0.6, fiber_g: 0, sugar_g: 5.8, sodium_mg: 70, iron_mg: 0.1, calcium_mg: 176, magnesium_mg: 16, zinc_mg: 0.8, potassium_mg: 255, phosphorus_mg: 145, vitamin_c_mg: 1.2, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 13, selenium_mcg: 3.3, iodine_mcg: 12, omega3_g: 0.01, dha_mg: 0, glycemic_index: 35 },
    'High protein, low calorie. Live probiotic cultures. Higher calcium per calorie than full-fat curd.'),
]

// ─── SPICES & HERBS ───────────────────────────────────────────────────────────

const spices = [
  food('turmeric', 'Turmeric (Haldi)', 'Turmeric | மஞ்சள் | हल्दी', 'spice', '🟡', 'any', ['vegetarian', 'vegan'],
    ['Anti-Inflammatory', 'Immune-Boost', 'Brain-Health', 'Gut-Health', 'Sattvic'],
    { calories: 312, protein_g: 9.7, carbs_g: 67.1, fat_g: 3.3, fiber_g: 22.7, sugar_g: 3.2, sodium_mg: 38, iron_mg: 55, calcium_mg: 183, magnesium_mg: 193, zinc_mg: 4.5, potassium_mg: 2525, phosphorus_mg: 268, vitamin_c_mg: 25.9, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 39, selenium_mcg: 6.2, iodine_mcg: 0, omega3_g: 0.15, dha_mg: 0, glycemic_index: 0 },
    'Curcumin gives turmeric its yellow colour and is one of the most studied anti-inflammatory compounds. Used in every Indian kitchen daily.'),

  food('cumin', 'Cumin (Jeera)', 'Cumin | சீரகம் | जीरा', 'spice', '🟤', 'any', ['vegetarian', 'vegan'],
    ['Gut-Health', 'Iron-Rich', 'Anti-Inflammatory', 'Diabetic-Friendly'],
    { calories: 375, protein_g: 17.8, carbs_g: 44.2, fat_g: 22.3, fiber_g: 10.5, sugar_g: 2.3, sodium_mg: 168, iron_mg: 66.4, calcium_mg: 931, magnesium_mg: 366, zinc_mg: 4.8, potassium_mg: 1788, phosphorus_mg: 499, vitamin_c_mg: 7.7, vitamin_a_mcg: 64, vitamin_d_mcg: 0, folate_mcg: 10, selenium_mcg: 5.2, iodine_mcg: 0, omega3_g: 0.2, dha_mg: 0, glycemic_index: 0 },
    'Exceptional iron content — 66mg/100g. Improves digestion by stimulating digestive enzymes. Core ingredient in tempering (tadka).'),

  food('coriander_seeds', 'Coriander Seeds (Dhaniya)', 'Coriander | கொத்தமல்லி விதை | धनिया', 'spice', '🟢', 'any', ['vegetarian', 'vegan'],
    ['Gut-Health', 'Diabetic-Friendly', 'Heart-Healthy', 'Anti-Inflammatory'],
    { calories: 298, protein_g: 12.4, carbs_g: 54.9, fat_g: 17.8, fiber_g: 41.9, sugar_g: 0, sodium_mg: 35, iron_mg: 16.3, calcium_mg: 709, magnesium_mg: 330, zinc_mg: 4.7, potassium_mg: 1267, phosphorus_mg: 409, vitamin_c_mg: 21, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 26.2, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 0 },
    'Highest fiber of all spices. Helps lower blood sugar and LDL cholesterol. Used as a whole spice in tempering.'),

  food('black_pepper', 'Black Pepper (Kali Mirch)', 'Black Pepper | மிளகு | काली मिर्च', 'spice', '⚫', 'any', ['vegetarian', 'vegan'],
    ['Immune-Boost', 'Anti-Inflammatory', 'Gut-Health', 'Brain-Health'],
    { calories: 251, protein_g: 10.4, carbs_g: 63.9, fat_g: 3.3, fiber_g: 25.3, sugar_g: 0.6, sodium_mg: 20, iron_mg: 28.9, calcium_mg: 437, magnesium_mg: 171, zinc_mg: 1.2, potassium_mg: 1329, phosphorus_mg: 173, vitamin_c_mg: 0, vitamin_a_mcg: 27, vitamin_d_mcg: 0, folate_mcg: 17, selenium_mcg: 3.1, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 0 },
    'Piperine increases absorption of curcumin by 2000%. Used in virtually every Indian dish for digestive benefits.'),

  food('cardamom', 'Cardamom (Elaichi)', 'Cardamom | ஏலக்காய் | इलायची', 'spice', '💚', 'any', ['vegetarian', 'vegan'],
    ['Gut-Health', 'Brain-Health', 'Anti-Inflammatory', 'Detox'],
    { calories: 311, protein_g: 10.8, carbs_g: 68.5, fat_g: 6.7, fiber_g: 28, sugar_g: 0, sodium_mg: 18, iron_mg: 13.9, calcium_mg: 383, magnesium_mg: 229, zinc_mg: 7.5, potassium_mg: 1119, phosphorus_mg: 178, vitamin_c_mg: 21, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0.1, iodine_mcg: 0, omega3_g: 0.11, dha_mg: 0, glycemic_index: 0 },
    'Used in chai and biryani. Freshens breath, reduces nausea. Highest zinc content among Indian spices.'),

  food('ginger_fresh', 'Fresh Ginger (Adrak)', 'Ginger | இஞ்சி | अदरक', 'spice', '🟫', 'any', ['vegetarian', 'vegan'],
    ['Anti-Inflammatory', 'Gut-Health', 'Immune-Boost', 'Hypertension-Safe'],
    { calories: 80, protein_g: 1.8, carbs_g: 17.8, fat_g: 0.8, fiber_g: 2, sugar_g: 1.7, sodium_mg: 13, iron_mg: 0.6, calcium_mg: 16, magnesium_mg: 43, zinc_mg: 0.3, potassium_mg: 415, phosphorus_mg: 34, vitamin_c_mg: 5, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 11, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.13, dha_mg: 0, glycemic_index: 15 },
    'Gingerols are potent anti-nausea and anti-inflammatory compounds. Used fresh in curries and chai.'),

  food('garlic_fresh', 'Fresh Garlic (Lahsun)', 'Garlic | பூண்டு | लहसुन', 'spice', '🧄', 'any', ['vegetarian', 'vegan'],
    ['Heart-Healthy', 'Immune-Boost', 'Anti-Inflammatory', 'Hypertension-Safe'],
    { calories: 149, protein_g: 6.4, carbs_g: 33.1, fat_g: 0.5, fiber_g: 2.1, sugar_g: 1, sodium_mg: 17, iron_mg: 1.7, calcium_mg: 181, magnesium_mg: 25, zinc_mg: 1.2, potassium_mg: 401, phosphorus_mg: 153, vitamin_c_mg: 31.2, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 3, selenium_mcg: 14.2, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 30 },
    'Allicin is released when garlic is crushed — reduces blood pressure and LDL. One of the most clinically studied foods for cardiovascular health.'),
]

// ─── MEATS & FISH ─────────────────────────────────────────────────────────────

const meats_fish = [
  food('chicken_breast', 'Chicken Breast (cooked)', 'Chicken | கோழி | चिकन', 'meat', '🍗', 'any', ['non-vegetarian'],
    ['High-Protein', 'Muscle-Building', 'Low-Fat', 'Weight-Loss'],
    { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0, sugar_g: 0, sodium_mg: 74, iron_mg: 1, calcium_mg: 15, magnesium_mg: 29, zinc_mg: 1, potassium_mg: 256, phosphorus_mg: 220, vitamin_c_mg: 0, vitamin_a_mcg: 15, vitamin_d_mcg: 0.1, folate_mcg: 4, selenium_mcg: 27.6, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 19, glycemic_index: 0 },
    'Leanest animal protein. 31g protein per 100g with very low fat. Essential for muscle building and post-workout recovery.'),

  food('egg_whole', 'Whole Egg (cooked)', 'Egg | முட்டை | अंडा', 'meat', '🥚', 'any', ['non-vegetarian', 'eggetarian'],
    ['High-Protein', 'Muscle-Building', 'Brain-Health', 'B12-Rich', 'Vitamin-D-Rich'],
    { calories: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11, fiber_g: 0, sugar_g: 1.1, sodium_mg: 124, iron_mg: 1.8, calcium_mg: 56, magnesium_mg: 12, zinc_mg: 1.3, potassium_mg: 138, phosphorus_mg: 191, vitamin_c_mg: 0, vitamin_a_mcg: 160, vitamin_d_mcg: 2, folate_mcg: 47, selenium_mcg: 30.7, iodine_mcg: 53, omega3_g: 0.1, dha_mg: 85, glycemic_index: 0 },
    'Most complete protein — all essential amino acids in the right ratio. Yolk contains choline (brain health), Vitamin D, B12, and iodine.'),

  food('rohu_fish', 'Rohu Fish (cooked)', 'Rohu | ரோஹு | रोहू मछली', 'meat', '🐟', 'any', ['non-vegetarian'],
    ['High-Protein', 'Omega-3-Rich', 'Heart-Healthy', 'Brain-Health'],
    { calories: 97, protein_g: 16.6, carbs_g: 0, fat_g: 3.4, fiber_g: 0, sugar_g: 0, sodium_mg: 47, iron_mg: 1, calcium_mg: 650, magnesium_mg: 23, zinc_mg: 1, potassium_mg: 310, phosphorus_mg: 170, vitamin_c_mg: 0, vitamin_a_mcg: 25, vitamin_d_mcg: 4, folate_mcg: 6, selenium_mcg: 36, iodine_mcg: 24, omega3_g: 0.8, dha_mg: 300, glycemic_index: 0 },
    'Most popular freshwater fish in India. Excellent calcium (650mg — more than milk!) and Vitamin D source. Rich in omega-3 DHA for brain health.'),

  food('hilsa_fish', 'Hilsa Fish (Ilish)', 'Hilsa | இலிஷ் | हिल्सा', 'meat', '🐠', 'any', ['non-vegetarian'],
    ['Omega-3-Rich', 'Heart-Healthy', 'Brain-Health', 'B12-Rich'],
    { calories: 273, protein_g: 21.8, carbs_g: 0, fat_g: 19.4, fiber_g: 0, sugar_g: 0, sodium_mg: 57, iron_mg: 1.5, calcium_mg: 320, magnesium_mg: 28, zinc_mg: 1.4, potassium_mg: 340, phosphorus_mg: 220, vitamin_c_mg: 0, vitamin_a_mcg: 40, vitamin_d_mcg: 8, folate_mcg: 8, selenium_mcg: 40, iodine_mcg: 25, omega3_g: 2.8, dha_mg: 1200, glycemic_index: 0 },
    'King of Indian fish — highest DHA omega-3 (1200mg). A national fish of Bangladesh, beloved in Bengal. High fat makes it exceptionally rich in omega-3.'),

  food('mutton_lean', 'Mutton / Goat (lean, cooked)', 'Mutton | ஆட்டிறைச்சி | बकरा', 'meat', '🍖', 'any', ['non-vegetarian'],
    ['High-Protein', 'Iron-Rich', 'Zinc-Rich', 'B12-Rich', 'Muscle-Building'],
    { calories: 218, protein_g: 25.6, carbs_g: 0, fat_g: 12.7, fiber_g: 0, sugar_g: 0, sodium_mg: 82, iron_mg: 3.5, calcium_mg: 13, magnesium_mg: 22, zinc_mg: 4.8, potassium_mg: 318, phosphorus_mg: 182, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0.3, folate_mcg: 8, selenium_mcg: 12, iodine_mcg: 3, omega3_g: 0.3, dha_mg: 40, glycemic_index: 0 },
    'Leaner than beef/pork. High in easily absorbed heme iron and zinc — important for Indian women with anemia. Major protein in North Indian cuisine.'),
]

// ─── OILS & FATS ──────────────────────────────────────────────────────────────

const oils = [
  food('coconut_oil', 'Coconut Oil', 'Coconut Oil | தேங்காய் எண்ணெய் | नारियल तेल', 'dairy', '🫙', 'any', ['vegetarian', 'vegan'],
    ['Energy-Dense', 'Brain-Health', 'Traditional', 'Sattvic'],
    { calories: 892, protein_g: 0, carbs_g: 0, fat_g: 100, fiber_g: 0, sugar_g: 0, sodium_mg: 0, iron_mg: 0, calcium_mg: 1, magnesium_mg: 0, zinc_mg: 0, potassium_mg: 0, phosphorus_mg: 0, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 0 },
    'Rich in MCTs (medium-chain triglycerides) that are metabolized rapidly for energy. Traditional cooking oil in South India and Kerala.'),

  food('mustard_oil', 'Mustard Oil (Sarson Tel)', 'Mustard Oil | கடுகு எண்ணெய் | सरसों तेल', 'dairy', '🟡', 'any', ['vegetarian', 'vegan'],
    ['Heart-Healthy', 'Anti-Inflammatory', 'Omega-3-Rich'],
    { calories: 884, protein_g: 0, carbs_g: 0, fat_g: 100, fiber_g: 0, sugar_g: 0, sodium_mg: 0, iron_mg: 0.1, calcium_mg: 0, magnesium_mg: 0, zinc_mg: 0, potassium_mg: 0, phosphorus_mg: 0, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0, iodine_mcg: 0, omega3_g: 5.9, dha_mg: 0, glycemic_index: 0 },
    'Dominant cooking oil in Bengal and North India. High in alpha-linolenic acid (ALA omega-3) and erucic acid. Antimicrobial properties.'),
]

// ─── BEVERAGES ────────────────────────────────────────────────────────────────

const beverages = [
  food('masala_chai', 'Masala Chai (with milk)', 'Masala Chai | மசாலா தேநீர் | मसाला चाय', 'dairy', '☕', 'any', ['vegetarian'],
    ['Anti-Inflammatory', 'Brain-Health', 'Gut-Health', 'Traditional'],
    { calories: 42, protein_g: 1.8, carbs_g: 6.8, fat_g: 1.1, fiber_g: 0.2, sugar_g: 5.8, sodium_mg: 28, iron_mg: 0.2, calcium_mg: 65, magnesium_mg: 10, zinc_mg: 0.1, potassium_mg: 95, phosphorus_mg: 50, vitamin_c_mg: 0, vitamin_a_mcg: 30, vitamin_d_mcg: 0, folate_mcg: 3, selenium_mcg: 1.5, iodine_mcg: 15, omega3_g: 0.02, dha_mg: 0, glycemic_index: 30 },
    'India\'s national drink. Spices (ginger, cardamom, cinnamon, pepper) have synergistic anti-inflammatory effects. Moderate caffeine from black tea.'),

  food('coconut_water', 'Fresh Coconut Water', 'Coconut Water | தேங்காய் தண்ணீர் | नारियल पानी', 'fruit', '🥥', 'any', ['vegetarian', 'vegan'],
    ['Hypertension-Safe', 'Detox', 'Magnesium-Rich', 'Gut-Health'],
    { calories: 19, protein_g: 0.7, carbs_g: 3.7, fat_g: 0.2, fiber_g: 1.1, sugar_g: 2.6, sodium_mg: 105, iron_mg: 0.3, calcium_mg: 24, magnesium_mg: 25, zinc_mg: 0.1, potassium_mg: 250, phosphorus_mg: 20, vitamin_c_mg: 2.4, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 16, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 54 },
    'Nature\'s electrolyte drink — replaces potassium, magnesium, and sodium lost in sweat. Better than commercial sports drinks for rehydration.'),

  food('buttermilk', 'Buttermilk / Chaas', 'Buttermilk | மோர் | छाछ', 'dairy', '🥛', 'any', ['vegetarian'],
    ['Probiotic', 'Gut-Health', 'Weight-Loss', 'Hypertension-Safe', 'Low-Fat'],
    { calories: 40, protein_g: 3.3, carbs_g: 4.8, fat_g: 0.9, fiber_g: 0, sugar_g: 4.8, sodium_mg: 105, iron_mg: 0.1, calcium_mg: 116, magnesium_mg: 11, zinc_mg: 0.4, potassium_mg: 151, phosphorus_mg: 85, vitamin_c_mg: 1, vitamin_a_mcg: 19, vitamin_d_mcg: 0, folate_mcg: 5, selenium_mcg: 3.7, iodine_mcg: 30, omega3_g: 0.01, dha_mg: 0, glycemic_index: 32 },
    'Traditional summer drink. Live probiotic cultures improve gut microbiome. High in iodine for thyroid health. Low calorie and filling.'),
]

// ─── MILLETS ──────────────────────────────────────────────────────────────────

const millets = [
  food('ragi', 'Ragi / Finger Millet', 'Ragi | ராகி | रागी', 'millet', '🌾', ['breakfast', 'lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Calcium-Rich', 'Iron-Rich', 'High-Fiber', 'Diabetic-Friendly', 'Bone-Health', 'Weight-Loss'],
    { calories: 328, protein_g: 7.3, carbs_g: 72, fat_g: 1.9, fiber_g: 3.6, sugar_g: 1.5, sodium_mg: 11, iron_mg: 3.9, calcium_mg: 344, magnesium_mg: 137, zinc_mg: 2.3, potassium_mg: 408, phosphorus_mg: 283, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 18, selenium_mcg: 2.7, iodine_mcg: 0, omega3_g: 0.07, dha_mg: 0, glycemic_index: 68 },
    'Richest cereal source of calcium (344mg/100g) — more than milk per calorie. Rich in iron and amino acids. Used for ragi mudde, ragi dosa, ragi porridge, and ragi malt.'),

  food('bajra', 'Bajra / Pearl Millet', 'Bajra | கம்பு | बाजरा', 'millet', '🌾', ['breakfast', 'lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'High-Protein', 'Energy-Dense', 'Heart-Healthy', 'Magnesium-Rich', 'Traditional'],
    { calories: 361, protein_g: 11.6, carbs_g: 67.5, fat_g: 5, fiber_g: 1.2, sugar_g: 0, sodium_mg: 10.9, iron_mg: 8, calcium_mg: 42, magnesium_mg: 137, zinc_mg: 3.1, potassium_mg: 307, phosphorus_mg: 296, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 85, selenium_mcg: 9.5, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 55 },
    'Highest iron content among all millets (8mg/100g). Very high in protein (11.6g). Widely eaten in Rajasthan as bajre ki roti. Excellent for anaemia and pregnancy.'),

  food('jowar', 'Jowar / Sorghum', 'Jowar | சோளம் | ज्वार', 'millet', '🌽', ['breakfast', 'lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Fiber', 'Diabetic-Friendly', 'Heart-Healthy', 'Low-GI', 'Traditional'],
    { calories: 349, protein_g: 10.4, carbs_g: 72.6, fat_g: 1.9, fiber_g: 6.3, sugar_g: 2, sodium_mg: 6.3, iron_mg: 4.1, calcium_mg: 25, magnesium_mg: 165, zinc_mg: 1.7, potassium_mg: 350, phosphorus_mg: 287, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 20, selenium_mcg: 14, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 49 },
    'Staple crop in Maharashtra, Karnataka, and Andhra Pradesh. Very high fiber controls blood sugar and cholesterol. Gluten-free with high antioxidant content.'),

  food('foxtail_millet', 'Foxtail Millet (Kangni/Thinai)', 'Foxtail Millet | தினை | कंगनी', 'millet', '🌾', ['breakfast', 'lunch'], ['vegetarian', 'vegan'],
    ['Diabetic-Friendly', 'Weight-Loss', 'High-Protein', 'Iron-Rich', 'Traditional'],
    { calories: 331, protein_g: 12.3, carbs_g: 63.2, fat_g: 4.3, fiber_g: 8, sugar_g: 1, sodium_mg: 4.7, iron_mg: 2.8, calcium_mg: 31, magnesium_mg: 81, zinc_mg: 2.4, potassium_mg: 250, phosphorus_mg: 290, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 45, selenium_mcg: 5.8, iodine_mcg: 0, omega3_g: 0.12, dha_mg: 0, glycemic_index: 50 },
    'Highest protein among common millets (12.3g/100g). Traditional South Indian grain used in thinai pongal and pulao. Excellent for diabetes and weight management.'),

  food('kodo_millet', 'Kodo Millet (Varagu)', 'Kodo Millet | வரகு | कोदो', 'millet', '🌾', ['breakfast', 'lunch'], ['vegetarian', 'vegan'],
    ['Diabetic-Friendly', 'Weight-Loss', 'High-Fiber', 'Low-GI', 'PCOD-Friendly'],
    { calories: 309, protein_g: 8.3, carbs_g: 65.9, fat_g: 1.4, fiber_g: 9, sugar_g: 0.5, sodium_mg: 3, iron_mg: 0.5, calcium_mg: 27, magnesium_mg: 90, zinc_mg: 1.5, potassium_mg: 163, phosphorus_mg: 170, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 15, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 50 },
    'One of the lowest calorie millets with highest fiber. Traditional millet of Madhya Pradesh. Excellent for PCOD and weight management.'),

  food('little_millet', 'Little Millet (Samai/Kutki)', 'Little Millet | சாமை | कुटकी', 'millet', '🌾', ['breakfast', 'lunch'], ['vegetarian', 'vegan'],
    ['Weight-Loss', 'High-Fiber', 'Diabetic-Friendly', 'Low-GI', 'Iron-Rich', 'Traditional'],
    { calories: 329, protein_g: 7.7, carbs_g: 67, fat_g: 4.7, fiber_g: 7.6, sugar_g: 0.5, sodium_mg: 6, iron_mg: 9.3, calcium_mg: 17, magnesium_mg: 96, zinc_mg: 1.3, potassium_mg: 236, phosphorus_mg: 220, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 14, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 52 },
    'Highest iron content (9.3mg/100g) among all millets. Low GI and high fiber ideal for diabetes and PCOD. Used as samai rice substitute in South India.'),

  food('barnyard_millet', 'Barnyard Millet (Sanwa)', 'Barnyard Millet | குதிரைவாலி | सांवा', 'millet', '🌾', ['breakfast', 'lunch'], ['vegetarian', 'vegan'],
    ['Weight-Loss', 'High-Fiber', 'Diabetic-Friendly', 'Iron-Rich', 'Traditional'],
    { calories: 300, protein_g: 6.2, carbs_g: 65.5, fat_g: 2.9, fiber_g: 13.6, sugar_g: 0.3, sodium_mg: 6.2, iron_mg: 15.2, calcium_mg: 20, magnesium_mg: 82, zinc_mg: 3, potassium_mg: 190, phosphorus_mg: 280, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 12, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 50 },
    'Highest fiber (13.6g/100g) and iron (15.2mg/100g) among all millets. Consumed during Navratri fasting in North India. Exceptional for weight loss and diabetes.'),

  food('proso_millet', 'Proso Millet (Chena)', 'Proso Millet | பனிவரகு | चेना', 'millet', '🌾', ['breakfast', 'lunch'], ['vegetarian', 'vegan'],
    ['High-Protein', 'Energy-Dense', 'Traditional'],
    { calories: 364, protein_g: 12, carbs_g: 70.4, fat_g: 3.5, fiber_g: 2.2, sugar_g: 0, sodium_mg: 4.9, iron_mg: 0.8, calcium_mg: 14, magnesium_mg: 114, zinc_mg: 1.6, potassium_mg: 195, phosphorus_mg: 290, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 17, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.09, dha_mg: 0, glycemic_index: 60 },
    'High protein and energy. Quickest cooking millet. Traditional food in Central India.'),

  food('browntop_millet', 'Browntop Millet (Andu Korra)', 'Browntop Millet | கோர்ல | अंडु कोर्रा', 'millet', '🌾', ['breakfast', 'lunch'], ['vegetarian', 'vegan'],
    ['High-Fiber', 'Diabetic-Friendly', 'Weight-Loss', 'High-Protein', 'Traditional'],
    { calories: 309, protein_g: 11.5, carbs_g: 62.7, fat_g: 4.2, fiber_g: 12.5, sugar_g: 0.3, sodium_mg: 6, iron_mg: 0.65, calcium_mg: 24, magnesium_mg: 79, zinc_mg: 1.2, potassium_mg: 100, phosphorus_mg: 225, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 14, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.06, dha_mg: 0, glycemic_index: 50 },
    'Traditional millet of Andhra Pradesh and Telangana. High protein and fiber. Excellent for weight loss and diabetes management.'),
]

// ─── TRADITIONAL INDIAN DISHES ───────────────────────────────────────────────

const traditional_dishes = [
  food('khichdi', 'Khichdi (Dal-Rice)', 'Khichdi | கிச்சடி | खिचड़ी', 'dish', '🍲', ['lunch', 'dinner'], ['vegetarian'],
    ['Gut-Health', 'Low-GI', 'High-Protein', 'Sattvic', 'Traditional'],
    { calories: 110, protein_g: 4.8, carbs_g: 20, fat_g: 1.8, fiber_g: 2.2, sugar_g: 0.5, sodium_mg: 180, iron_mg: 1.1, calcium_mg: 28, magnesium_mg: 22, zinc_mg: 0.6, potassium_mg: 180, phosphorus_mg: 95, vitamin_c_mg: 1, vitamin_a_mcg: 12, vitamin_d_mcg: 0, folate_mcg: 35, selenium_mcg: 4, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 45 },
    'India\'s original comfort food and Ayurvedic medicine food. Perfect protein-carb balance. Easy to digest, prescribed for illness recovery.'),

  food('rajma', 'Rajma (Red Kidney Bean Curry)', 'Rajma | ராஜ்மா | राजमा', 'dish', '🫘', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Protein', 'High-Fiber', 'Iron-Rich', 'Folate-Rich', 'Heart-Healthy', 'Diabetic-Friendly'],
    { calories: 127, protein_g: 8.7, carbs_g: 22.8, fat_g: 0.5, fiber_g: 6.4, sugar_g: 0.3, sodium_mg: 240, iron_mg: 2.6, calcium_mg: 28, magnesium_mg: 45, zinc_mg: 1.4, potassium_mg: 403, phosphorus_mg: 140, vitamin_c_mg: 2, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 130, selenium_mcg: 3.2, iodine_mcg: 0, omega3_g: 0.18, dha_mg: 0, glycemic_index: 24 },
    'Punjabi staple high in plant protein and folate. Very low GI (24) ideal for diabetes. Rich in resistant starch feeding good gut bacteria.'),

  food('chole', 'Chole (Chickpea Curry)', 'Chole | சோலே | छोले', 'dish', '🫘', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'High-Fiber', 'Heart-Healthy'],
    { calories: 164, protein_g: 8.9, carbs_g: 27.4, fat_g: 2.6, fiber_g: 7.6, sugar_g: 1.5, sodium_mg: 280, iron_mg: 2.9, calcium_mg: 49, magnesium_mg: 48, zinc_mg: 1.5, potassium_mg: 477, phosphorus_mg: 168, vitamin_c_mg: 3, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 172, selenium_mcg: 3.7, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 28 },
    'Nutritional powerhouse. High in folate (172mcg — 86% RDA), iron, and plant protein. Low GI perfect for diabetes management.'),

  food('palak_paneer', 'Palak Paneer', 'Palak Paneer | பாலக் பனீர் | पालक पनीर', 'dish', '🥬', ['lunch', 'dinner'], ['vegetarian'],
    ['Iron-Rich', 'Calcium-Rich', 'High-Protein', 'Folate-Rich', 'Bone-Health'],
    { calories: 185, protein_g: 11.2, carbs_g: 8.4, fat_g: 12.6, fiber_g: 2.8, sugar_g: 2.2, sodium_mg: 320, iron_mg: 3.1, calcium_mg: 218, magnesium_mg: 52, zinc_mg: 1.2, potassium_mg: 390, phosphorus_mg: 180, vitamin_c_mg: 28, vitamin_a_mcg: 460, vitamin_d_mcg: 0, folate_mcg: 145, selenium_mcg: 4.1, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 25 },
    'Iron from spinach + Vitamin C absorption enhancer + calcium from paneer. One of the most complete vegetarian dishes nutritionally.'),

  food('sambhar', 'Sambhar (South Indian Dal)', 'Sambhar | சாம்பார் | सांभर', 'dish', '🍲', ['breakfast', 'lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Fiber', 'Iron-Rich', 'Folate-Rich', 'Gut-Health', 'Traditional', 'Low-GI'],
    { calories: 65, protein_g: 3.5, carbs_g: 10.8, fat_g: 1.2, fiber_g: 3.2, sugar_g: 1.8, sodium_mg: 380, iron_mg: 1.5, calcium_mg: 42, magnesium_mg: 30, zinc_mg: 0.7, potassium_mg: 285, phosphorus_mg: 75, vitamin_c_mg: 18, vitamin_a_mcg: 180, vitamin_d_mcg: 0, folate_mcg: 58, selenium_mcg: 2.5, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 35 },
    'South Indian comfort food combining toor dal with seasonal vegetables and tamarind. Rich in vitamins from mixed vegetables and digestive spices.'),

  food('poha', 'Poha (Beaten Rice Breakfast)', 'Poha | அவல் | पोहा', 'dish', '🍚', ['breakfast', 'snack'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Low-Fat', 'Energy-Dense', 'Traditional'],
    { calories: 130, protein_g: 2.6, carbs_g: 28, fat_g: 1, fiber_g: 0.8, sugar_g: 0.2, sodium_mg: 150, iron_mg: 2.7, calcium_mg: 14, magnesium_mg: 12, zinc_mg: 0.4, potassium_mg: 65, phosphorus_mg: 52, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 5, selenium_mcg: 1.5, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 60 },
    'Popular Indian breakfast. Flattened rice is partially pre-cooked making it easier to digest. Iron-fortified poha provides 2.7mg iron per serving.'),

  food('upma', 'Upma (Semolina)', 'Upma | உப்மா | उपमा', 'dish', '🍲', ['breakfast'], ['vegetarian'],
    ['Energy-Dense', 'Iron-Rich', 'Traditional'],
    { calories: 145, protein_g: 4.1, carbs_g: 28.4, fat_g: 2.8, fiber_g: 1.5, sugar_g: 0.5, sodium_mg: 190, iron_mg: 1.9, calcium_mg: 16, magnesium_mg: 20, zinc_mg: 0.6, potassium_mg: 110, phosphorus_mg: 82, vitamin_c_mg: 2, vitamin_a_mcg: 25, vitamin_d_mcg: 0, folate_mcg: 24, selenium_mcg: 2, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 56 },
    'South Indian breakfast made from semolina (sooji). Mustard seeds, curry leaves, and vegetables add nutrition.'),

  food('pongal', 'Ven Pongal (Rice-Dal)', 'Ven Pongal | வெண் பொங்கல் | पोंगल', 'dish', '🍚', ['breakfast', 'lunch'], ['vegetarian'],
    ['High-Protein', 'Sattvic', 'Traditional', 'Gut-Health'],
    { calories: 150, protein_g: 5.8, carbs_g: 27.5, fat_g: 2.8, fiber_g: 1.8, sugar_g: 0.2, sodium_mg: 160, iron_mg: 0.8, calcium_mg: 20, magnesium_mg: 28, zinc_mg: 0.7, potassium_mg: 140, phosphorus_mg: 105, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 22, selenium_mcg: 3, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 50 },
    'Festival food of Tamil Nadu. Complete protein from rice+dal combination. Ghee, pepper, and cumin add digestive benefit.'),

  food('rasam', 'Rasam (Tamarind Soup)', 'Rasam | ரசம் | रसम', 'dish', '🍵', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Anti-Inflammatory', 'Immune-Boost', 'Gut-Health', 'Detox', 'Traditional'],
    { calories: 35, protein_g: 1.2, carbs_g: 6.5, fat_g: 0.8, fiber_g: 1.1, sugar_g: 1, sodium_mg: 290, iron_mg: 1.1, calcium_mg: 24, magnesium_mg: 18, zinc_mg: 0.2, potassium_mg: 200, phosphorus_mg: 35, vitamin_c_mg: 12, vitamin_a_mcg: 45, vitamin_d_mcg: 0, folate_mcg: 15, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 25 },
    'South Indian digestive soup. Black pepper piperine enhances curcumin absorption and has antiviral properties. Home remedy for cold and cough.'),

  food('pesarattu', 'Pesarattu (Moong Dal Dosa)', 'Pesarattu | பெசரட்டு | पेसरट्टू', 'dish', '🥞', ['breakfast'], ['vegetarian', 'vegan'],
    ['High-Protein', 'Folate-Rich', 'Diabetic-Friendly', 'Weight-Loss', 'Traditional'],
    { calories: 150, protein_g: 10, carbs_g: 26, fat_g: 1.2, fiber_g: 4.5, sugar_g: 0.5, sodium_mg: 140, iron_mg: 2, calcium_mg: 38, magnesium_mg: 48, zinc_mg: 1.1, potassium_mg: 390, phosphorus_mg: 200, vitamin_c_mg: 3, vitamin_a_mcg: 5, vitamin_d_mcg: 0, folate_mcg: 160, selenium_mcg: 3, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 42 },
    'Andhra breakfast made from whole green moong. Highest protein dosa (10g/100g). High folate (160mcg — 80% RDA) ideal during pregnancy.'),

  food('dal_makhani', 'Dal Makhani', 'Dal Makhani | டால் மக்கனி | दाल मखनी', 'dish', '🫘', ['lunch', 'dinner'], ['vegetarian'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'Heart-Healthy', 'Traditional'],
    { calories: 180, protein_g: 10.2, carbs_g: 24, fat_g: 5.5, fiber_g: 7.8, sugar_g: 1.5, sodium_mg: 380, iron_mg: 3.2, calcium_mg: 62, magnesium_mg: 65, zinc_mg: 1.6, potassium_mg: 510, phosphorus_mg: 195, vitamin_c_mg: 2, vitamin_a_mcg: 65, vitamin_d_mcg: 0, folate_mcg: 120, selenium_mcg: 3.8, iodine_mcg: 0, omega3_g: 0.12, dha_mg: 0, glycemic_index: 22 },
    'Slow-cooked black lentil and kidney bean curry. Ultra-low GI (22). High in all essential nutrients including iron, folate, and plant protein.'),

  food('avial', 'Avial (Kerala Mixed Vegetable)', 'Avial | அவியல் | अवियल', 'dish', '🥘', ['lunch', 'dinner'], ['vegetarian'],
    ['High-Fiber', 'Immune-Boost', 'Traditional', 'Probiotic'],
    { calories: 115, protein_g: 3.5, carbs_g: 16, fat_g: 4.8, fiber_g: 4.5, sugar_g: 3.5, sodium_mg: 180, iron_mg: 1.5, calcium_mg: 65, magnesium_mg: 35, zinc_mg: 0.7, potassium_mg: 410, phosphorus_mg: 80, vitamin_c_mg: 40, vitamin_a_mcg: 280, vitamin_d_mcg: 0, folate_mcg: 55, selenium_mcg: 2.2, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 40 },
    'Kerala classic with 10+ seasonal vegetables in yoghurt and coconut. Exceptional micronutrient diversity. Coconut adds healthy MCTs.'),

  food('thoran', 'Thoran (Kerala Dry Stir Fry)', 'Thoran | தோரன் | थोरन', 'dish', '🥬', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'High-Fiber', 'Traditional', 'Low-Calorie'],
    { calories: 90, protein_g: 3.2, carbs_g: 12.5, fat_g: 3.5, fiber_g: 5, sugar_g: 2, sodium_mg: 140, iron_mg: 2.2, calcium_mg: 85, magnesium_mg: 42, zinc_mg: 0.8, potassium_mg: 380, phosphorus_mg: 65, vitamin_c_mg: 48, vitamin_a_mcg: 360, vitamin_d_mcg: 0, folate_mcg: 70, selenium_mcg: 1.5, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 30 },
    'Kerala dry stir fry with green beans, cabbage, or raw banana with grated coconut. High in micronutrients and fiber.'),
]

// ─── HERBS & SUPERFOODS ───────────────────────────────────────────────────────

const herbs = [
  food('moringa', 'Moringa Leaves (Drumstick)', 'Moringa | முருங்கைக்கீரை | मुनगा', 'vegetable', '🌿', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'Immune-Boost', 'Anti-Inflammatory', 'Traditional', 'Folate-Rich'],
    { calories: 64, protein_g: 9.4, carbs_g: 8.3, fat_g: 1.4, fiber_g: 2, sugar_g: 3.2, sodium_mg: 9, iron_mg: 4, calcium_mg: 185, magnesium_mg: 147, zinc_mg: 0.6, potassium_mg: 337, phosphorus_mg: 112, vitamin_c_mg: 51.7, vitamin_a_mcg: 378, vitamin_d_mcg: 0, folate_mcg: 40, selenium_mcg: 0.9, iodine_mcg: 0, omega3_g: 0.21, dha_mg: 0, glycemic_index: 30 },
    'Called "miracle tree" — 7× more Vitamin C than orange, 4× more calcium than milk, 4× more Vitamin A than carrots. Exceptionally nutrient-dense per calorie.'),

  food('curry_leaves', 'Curry Leaves (Kadi Patta)', 'Curry Leaves | கறிவேப்பிலை | कड़ी पत्ता', 'spice', '🌿', ['any'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Immune-Boost', 'Anti-Inflammatory', 'Traditional', 'Brain-Health', 'Calcium-Rich'],
    { calories: 108, protein_g: 6.1, carbs_g: 18.7, fat_g: 1, fiber_g: 6.4, sugar_g: 3, sodium_mg: 103, iron_mg: 0.9, calcium_mg: 810, magnesium_mg: 44, zinc_mg: 0.2, potassium_mg: 48, phosphorus_mg: 600, vitamin_c_mg: 4, vitamin_a_mcg: 148, vitamin_d_mcg: 0, folate_mcg: 93, selenium_mcg: 0.2, iodine_mcg: 0, omega3_g: 0.01, dha_mg: 0, glycemic_index: 30 },
    'Fresh curry leaves contain carbazole alkaloids with anti-inflammatory properties. Extreme calcium content (810mg/100g). Used in tempering across South Indian cooking.'),

  food('fenugreek_leaves', 'Methi Leaves (Fenugreek)', 'Methi | வெந்தய கீரை | मेथी साग', 'vegetable', '🌿', ['breakfast', 'lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'Folate-Rich', 'Diabetic-Friendly', 'PCOD-Friendly', 'Traditional'],
    { calories: 49, protein_g: 4.4, carbs_g: 6, fat_g: 0.9, fiber_g: 1.1, sugar_g: 1.5, sodium_mg: 76, iron_mg: 1.9, calcium_mg: 395, magnesium_mg: 37, zinc_mg: 0.9, potassium_mg: 31, phosphorus_mg: 51, vitamin_c_mg: 3, vitamin_a_mcg: 395, vitamin_d_mcg: 0, folate_mcg: 44, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 35 },
    'One of the highest calcium leafy vegetables (395mg/100g). Galactomannan fiber reduces post-meal blood sugar spikes significantly.'),

  food('amaranth_leaves', 'Amaranth Leaves (Rajgira/Cholai)', 'Amaranth | முளைக்கீரை | राजगिरा साग', 'vegetable', '🌿', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Calcium-Rich', 'High-Protein', 'Folate-Rich', 'Anti-Inflammatory'],
    { calories: 23, protein_g: 2.5, carbs_g: 4, fat_g: 0.3, fiber_g: 2.2, sugar_g: 1.5, sodium_mg: 20, iron_mg: 3.1, calcium_mg: 215, magnesium_mg: 55, zinc_mg: 0.9, potassium_mg: 611, phosphorus_mg: 50, vitamin_c_mg: 43, vitamin_a_mcg: 292, vitamin_d_mcg: 0, folate_mcg: 85, selenium_mcg: 0.9, iodine_mcg: 0, omega3_g: 0.07, dha_mg: 0, glycemic_index: 25 },
    'Traditional Indian leafy green with extraordinary iron, calcium, and Vitamin A. Called "poor man\'s spinach" for its nutrition per rupee.'),

  food('tulsi', 'Tulsi (Holy Basil)', 'Tulsi | துளசி | तुलसी', 'herb', '🌿', ['any'], ['vegetarian', 'vegan'],
    ['Immune-Boost', 'Anti-Inflammatory', 'Brain-Health', 'Traditional', 'Sattvic'],
    { calories: 22, protein_g: 3.2, carbs_g: 2.7, fat_g: 0.6, fiber_g: 1.6, sugar_g: 0.5, sodium_mg: 4, iron_mg: 3.2, calcium_mg: 177, magnesium_mg: 64, zinc_mg: 0.8, potassium_mg: 295, phosphorus_mg: 56, vitamin_c_mg: 18, vitamin_a_mcg: 264, vitamin_d_mcg: 0, folate_mcg: 68, selenium_mcg: 0.3, iodine_mcg: 0, omega3_g: 0.31, dha_mg: 0, glycemic_index: 20 },
    'Sacred Ayurvedic adaptogen. Eugenol and ursolic acid have potent anti-inflammatory effects. Used as tea for immunity, as kadha during illness.'),
]

// ─── RICE VARIETIES ───────────────────────────────────────────────────────────

const rice_varieties = [
  food('kavuni_arisi', 'Kavuni Arisi (Black Rice)', 'Kavuni Arisi | கவுனி அரிசி | काला चावल', 'grain', '🟣', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Anti-Inflammatory', 'Iron-Rich', 'High-Fiber', 'Heart-Healthy', 'Diabetic-Friendly', 'Traditional'],
    { calories: 356, protein_g: 8.9, carbs_g: 76, fat_g: 3.5, fiber_g: 4.5, sugar_g: 0.4, sodium_mg: 4, iron_mg: 3.5, calcium_mg: 20, magnesium_mg: 45, zinc_mg: 2, potassium_mg: 278, phosphorus_mg: 185, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 20, selenium_mcg: 12, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 42 },
    'Karuppu kavuni arisi — ancient black rice of Tamil Nadu. Anthocyanin pigment is a powerful antioxidant. Low GI, high iron. Used in Pongal festival.'),

  food('red_rice', 'Red Rice (Kerala Matta)', 'Matta Rice | கேரள சிவப்பு அரிசி | लाल चावल', 'grain', '🔴', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Fiber', 'Diabetic-Friendly', 'Iron-Rich', 'Magnesium-Rich', 'Traditional'],
    { calories: 351, protein_g: 7.5, carbs_g: 73, fat_g: 2.8, fiber_g: 3.5, sugar_g: 0.5, sodium_mg: 5, iron_mg: 2.1, calcium_mg: 14, magnesium_mg: 120, zinc_mg: 1.8, potassium_mg: 223, phosphorus_mg: 160, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 16, selenium_mcg: 11, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 55 },
    'Unpolished red rice retains bran layer with fiber and micronutrients. Kerala staple. Better glycemic response than white rice.'),

  food('brown_rice', 'Brown Rice (Whole Grain)', 'Brown Rice | தவிட்டு அரிசி | भूरा चावल', 'grain', '🟤', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Fiber', 'Diabetic-Friendly', 'Magnesium-Rich', 'Heart-Healthy'],
    { calories: 370, protein_g: 7.9, carbs_g: 77, fat_g: 2.9, fiber_g: 3.5, sugar_g: 0.4, sodium_mg: 7, iron_mg: 1.5, calcium_mg: 33, magnesium_mg: 143, zinc_mg: 2, potassium_mg: 223, phosphorus_mg: 264, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 20, selenium_mcg: 19, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 50 },
    'Whole grain rice with intact bran and germ. Rich in magnesium (143mg), selenium, and B vitamins compared to polished white rice.'),

  food('sona_masoori', 'Sona Masoori Rice', 'Sona Masuri | சோனா மசூரி | सोना मसूरी', 'grain', '🍚', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Low-GI', 'Traditional'],
    { calories: 346, protein_g: 6.8, carbs_g: 78, fat_g: 0.5, fiber_g: 0.6, sugar_g: 0.1, sodium_mg: 5, iron_mg: 0.7, calcium_mg: 10, magnesium_mg: 35, zinc_mg: 1.1, potassium_mg: 115, phosphorus_mg: 120, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 8, selenium_mcg: 10, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 51 },
    'Medium grain rice popular in Andhra and Karnataka. Lower glycemic index than typical white rice varieties.'),

  food('basmati_rice', 'Basmati Rice (cooked)', 'Basmati | பாஸ்மதி | बासमती', 'grain', '🌾', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Low-GI', 'Traditional'],
    { calories: 121, protein_g: 3.5, carbs_g: 25.2, fat_g: 0.4, fiber_g: 0.4, sugar_g: 0, sodium_mg: 1, iron_mg: 0.2, calcium_mg: 10, magnesium_mg: 13, zinc_mg: 0.6, potassium_mg: 55, phosphorus_mg: 68, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 5, selenium_mcg: 7.5, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 50 },
    'Long grain aromatic rice. Lower GI (50) than regular white rice. Used in biryani and pulao.'),
]

// ─── MORE FRUITS (commonly searched) ─────────────────────────────────────────

const more_fruits = [
  food('muskmelon', 'Muskmelon (Kharbooja)', 'Muskmelon | கஸ்தூரி பழம் | खरबूजा', 'fruit', '🍈', ['snack', 'breakfast'], ['vegetarian', 'vegan'],
    ['Low-GI', 'Hypertension-Safe', 'Immune-Boost', 'Detox'],
    { calories: 34, protein_g: 0.8, carbs_g: 8.2, fat_g: 0.2, fiber_g: 0.9, sugar_g: 7.9, sodium_mg: 16, iron_mg: 0.2, calcium_mg: 9, magnesium_mg: 12, zinc_mg: 0.2, potassium_mg: 267, phosphorus_mg: 15, vitamin_c_mg: 18, vitamin_a_mcg: 169, vitamin_d_mcg: 0, folate_mcg: 21, selenium_mcg: 0.4, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 65 },
    'Muskmelon juice is a popular summer cooler. High in beta-carotene (Vitamin A) and potassium. Hydrating with 90% water content.'),

  food('cantaloupe', 'Cantaloupe', 'Cantaloupe | கஸ்தூரி பழம் | खरबूजा', 'fruit', '🍈', ['snack'], ['vegetarian', 'vegan'],
    ['Immune-Boost', 'Detox', 'Low-GI'],
    { calories: 34, protein_g: 0.8, carbs_g: 8.2, fat_g: 0.2, fiber_g: 0.9, sugar_g: 7.9, sodium_mg: 16, iron_mg: 0.2, calcium_mg: 9, magnesium_mg: 12, zinc_mg: 0.2, potassium_mg: 267, phosphorus_mg: 15, vitamin_c_mg: 36.7, vitamin_a_mcg: 169, vitamin_d_mcg: 0, folate_mcg: 21, selenium_mcg: 0.4, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 65 },
    'Rich in Vitamin A and Vitamin C. Low in calories. A great summer fruit for skin health and immunity.'),

  food('pineapple', 'Pineapple (Ananas)', 'Pineapple | அன்னாசி | अनानास', 'fruit', '🍍', ['snack'], ['vegetarian', 'vegan'],
    ['Gut-Health', 'Immune-Boost', 'Anti-Inflammatory'],
    { calories: 50, protein_g: 0.5, carbs_g: 13.1, fat_g: 0.1, fiber_g: 1.4, sugar_g: 9.9, sodium_mg: 1, iron_mg: 0.3, calcium_mg: 13, magnesium_mg: 12, zinc_mg: 0.1, potassium_mg: 109, phosphorus_mg: 8, vitamin_c_mg: 47.8, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 18, selenium_mcg: 0.1, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 59 },
    'Contains bromelain enzyme that aids protein digestion and reduces inflammation. Rich in Vitamin C.'),

  food('litchi', 'Litchi (Lychee)', 'Litchi | லிச்சி | लीची', 'fruit', '🍓', ['snack'], ['vegetarian', 'vegan'],
    ['Immune-Boost', 'Heart-Healthy', 'Energy-Dense'],
    { calories: 66, protein_g: 0.8, carbs_g: 17, fat_g: 0.4, fiber_g: 1.3, sugar_g: 15.2, sodium_mg: 1, iron_mg: 0.3, calcium_mg: 5, magnesium_mg: 10, zinc_mg: 0.1, potassium_mg: 171, phosphorus_mg: 31, vitamin_c_mg: 71.5, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 14, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 50 },
    'One of the richest sources of Vitamin C (71.5mg). Contains oligonol with antioxidant and anti-flu properties.'),

  food('jamun', 'Jamun (Indian Blackberry)', 'Jamun | நாவல் பழம் | जामुन', 'fruit', '🫐', ['snack'], ['vegetarian', 'vegan'],
    ['Diabetic-Friendly', 'Low-GI', 'Anti-Inflammatory', 'Iron-Rich', 'Traditional'],
    { calories: 62, protein_g: 0.7, carbs_g: 14, fat_g: 0.3, fiber_g: 0.6, sugar_g: 12, sodium_mg: 26, iron_mg: 1.4, calcium_mg: 15, magnesium_mg: 15, zinc_mg: 0.2, potassium_mg: 79, phosphorus_mg: 17, vitamin_c_mg: 18, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 6, selenium_mcg: 0.6, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 25 },
    'Seeds and fruit lower blood sugar. Traditional Ayurvedic diabetes remedy. Anthocyanins give deep purple colour and antioxidant power.'),

  food('karonda', 'Karonda (Carissa)', 'Karonda | கலாக்காய் | करौंदा', 'fruit', '🫐', ['snack'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Vitamin-C-Rich', 'Immune-Boost'],
    { calories: 42, protein_g: 1.1, carbs_g: 9.3, fat_g: 0.6, fiber_g: 2.8, sugar_g: 5, sodium_mg: 3, iron_mg: 1.3, calcium_mg: 21, magnesium_mg: 16, zinc_mg: 0.3, potassium_mg: 260, phosphorus_mg: 28, vitamin_c_mg: 200, vitamin_a_mcg: 16, vitamin_d_mcg: 0, folate_mcg: 12, selenium_mcg: 0.5, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 35 },
    'Wild Indian berry exceptionally rich in Vitamin C (200mg/100g). Used in pickles and chutneys across India.'),
]

// ─── MORE VEGETABLES (commonly searched) ─────────────────────────────────────

const more_vegetables = [
  food('bitter_gourd', 'Bitter Gourd (Karela)', 'Karela | பாவக்காய் | करेला', 'vegetable', '🥒', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Diabetic-Friendly', 'Low-GI', 'Detox', 'Anti-Inflammatory', 'Traditional'],
    { calories: 17, protein_g: 1, carbs_g: 3.7, fat_g: 0.2, fiber_g: 2.8, sugar_g: 1.9, sodium_mg: 5, iron_mg: 0.4, calcium_mg: 19, magnesium_mg: 17, zinc_mg: 0.8, potassium_mg: 296, phosphorus_mg: 31, vitamin_c_mg: 84, vitamin_a_mcg: 21, vitamin_d_mcg: 0, folate_mcg: 72, selenium_mcg: 0.2, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 20 },
    'Charantin compound lowers blood sugar like insulin. Clinical studies support use in Type 2 diabetes management.'),

  food('bottle_gourd', 'Bottle Gourd (Lauki/Dudhi)', 'Lauki | சுரைக்காய் | लौकी', 'vegetable', '🥬', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Weight-Loss', 'Hypertension-Safe', 'Low-GI', 'Diabetic-Friendly', 'Gut-Health'],
    { calories: 14, protein_g: 0.6, carbs_g: 3.4, fat_g: 0.1, fiber_g: 0.5, sugar_g: 2.8, sodium_mg: 2, iron_mg: 0.2, calcium_mg: 26, magnesium_mg: 11, zinc_mg: 0.7, potassium_mg: 170, phosphorus_mg: 13, vitamin_c_mg: 10.1, vitamin_a_mcg: 16, vitamin_d_mcg: 0, folate_mcg: 6, selenium_mcg: 0.2, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 15 },
    '95% water content. Extremely low calorie. Diuretic and cooling effect. Ayurveda recommends for pitta dosha balancing.'),

  food('raw_banana', 'Raw Banana / Plantain (Valakkai)', 'Raw Banana | வாழைக்காய் | कच्चा केला', 'vegetable', '🫑', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Fiber', 'Gut-Health', 'Diabetic-Friendly', 'Low-GI', 'Traditional'],
    { calories: 89, protein_g: 1.3, carbs_g: 22.8, fat_g: 0.4, fiber_g: 2.6, sugar_g: 1.5, sodium_mg: 4, iron_mg: 0.6, calcium_mg: 3, magnesium_mg: 37, zinc_mg: 0.15, potassium_mg: 499, phosphorus_mg: 34, vitamin_c_mg: 18.4, vitamin_a_mcg: 4, vitamin_d_mcg: 0, folate_mcg: 22, selenium_mcg: 1.5, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 40 },
    'High in resistant starch that acts as prebiotic. Much lower GI than ripe banana. Traditional South Indian side dish as curry or chips.'),

  food('taro_root', 'Taro Root (Arbi/Colocasia)', 'Arbi | சேப்பங்கிழங்கு | अरबी', 'vegetable', '🥔', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Gut-Health', 'High-Fiber', 'Immune-Boost'],
    { calories: 112, protein_g: 1.5, carbs_g: 26.5, fat_g: 0.2, fiber_g: 4.1, sugar_g: 0.4, sodium_mg: 11, iron_mg: 0.6, calcium_mg: 43, magnesium_mg: 33, zinc_mg: 0.2, potassium_mg: 591, phosphorus_mg: 84, vitamin_c_mg: 4.5, vitamin_a_mcg: 4, vitamin_d_mcg: 0, folate_mcg: 22, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 55 },
    'Colocasia or taro — rich in resistant starch and fiber. High potassium (591mg). Traditional across South India and Maharashtra.'),

  food('elephant_yam', 'Elephant Yam (Suran/Senaikizhangu)', 'Suran | சேனைக்கிழங்கு | सूरन', 'vegetable', '🟤', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Fiber', 'Gut-Health', 'Diabetic-Friendly', 'Traditional'],
    { calories: 118, protein_g: 1.5, carbs_g: 27, fat_g: 0.1, fiber_g: 4.2, sugar_g: 0.5, sodium_mg: 9, iron_mg: 0.5, calcium_mg: 17, magnesium_mg: 21, zinc_mg: 0.2, potassium_mg: 816, phosphorus_mg: 55, vitamin_c_mg: 4, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 19, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 51 },
    'Extraordinarily high in potassium (816mg). Diosgenin compound shows anti-cancer properties in research.'),

  food('lotus_stem', 'Lotus Stem (Kamal Kakdi)', 'Kamal Kakdi | தாமரைக் கிழங்கு | कमल ककड़ी', 'vegetable', '🪷', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['Iron-Rich', 'Folate-Rich', 'High-Fiber', 'Traditional'],
    { calories: 74, protein_g: 2.6, carbs_g: 17.2, fat_g: 0.1, fiber_g: 4.9, sugar_g: 0.4, sodium_mg: 45, iron_mg: 1.2, calcium_mg: 45, magnesium_mg: 23, zinc_mg: 0.4, potassium_mg: 556, phosphorus_mg: 100, vitamin_c_mg: 44, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 13, selenium_mcg: 0.7, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 45 },
    'Popular in Kashmiri and North Indian cooking. Crispy texture. Good source of Vitamin C and iron.'),
]

// ─── MORE DRINKS / BEVERAGES ─────────────────────────────────────────────────

const more_beverages = [
  food('ragi_malt', 'Ragi Malt (Finger Millet Drink)', 'Ragi Malt | ராகி மால்ட் | रागी माल्ट', 'grain', '🥛', ['breakfast', 'snack'], ['vegetarian', 'vegan'],
    ['Calcium-Rich', 'Iron-Rich', 'Energy-Dense', 'Diabetic-Friendly', 'Traditional'],
    { calories: 152, protein_g: 4.5, carbs_g: 30, fat_g: 1.6, fiber_g: 2.8, sugar_g: 8, sodium_mg: 110, iron_mg: 3.9, calcium_mg: 344, magnesium_mg: 84, zinc_mg: 1.5, potassium_mg: 220, phosphorus_mg: 160, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 18, selenium_mcg: 2, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 65 },
    'Ragi (finger millet) cooked with milk, jaggery and sometimes banana. Exceptional calcium (344mg). Traditional weaning food, lactation drink, and energy breakfast.'),

  food('melon_juice', 'Muskmelon Juice', 'Melon Juice | கஸ்தூரி பழம் ஜூஸ் | खरबूजे का रस', 'fruit', '🥤', ['breakfast', 'snack'], ['vegetarian', 'vegan'],
    ['Hypertension-Safe', 'Detox', 'Immune-Boost'],
    { calories: 28, protein_g: 0.7, carbs_g: 6.5, fat_g: 0.1, fiber_g: 0.3, sugar_g: 6, sodium_mg: 14, iron_mg: 0.1, calcium_mg: 8, magnesium_mg: 10, zinc_mg: 0.1, potassium_mg: 230, phosphorus_mg: 12, vitamin_c_mg: 15, vitamin_a_mcg: 140, vitamin_d_mcg: 0, folate_mcg: 17, selenium_mcg: 0.3, iodine_mcg: 0, omega3_g: 0.02, dha_mg: 0, glycemic_index: 55 },
    'Fresh muskmelon juice — a summer cooling drink. Potassium and Vitamin A rich. Sold widely across India.'),

  food('sugarcane_juice', 'Sugarcane Juice (Ganne ka Ras)', 'Sugarcane Juice | கரும்பு சாறு | गन्ने का रस', 'fruit', '🥤', ['snack'], ['vegetarian', 'vegan'],
    ['Energy-Dense', 'Iron-Rich', 'Traditional'],
    { calories: 73, protein_g: 0.4, carbs_g: 17.5, fat_g: 0, fiber_g: 0, sugar_g: 17.5, sodium_mg: 7, iron_mg: 0.4, calcium_mg: 10, magnesium_mg: 9, zinc_mg: 0.1, potassium_mg: 176, phosphorus_mg: 3, vitamin_c_mg: 2, vitamin_a_mcg: 1, vitamin_d_mcg: 0, folate_mcg: 0, selenium_mcg: 0.1, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 43 },
    'Street beverage with iron and quick energy. Contains policosanol that may lower LDL. Do not confuse with refined sugar.'),

  food('tender_coconut_water', 'Tender Coconut Water', 'Tender Coconut Water | இளநீர் | नारियल पानी', 'fruit', '🥥', ['snack', 'breakfast'], ['vegetarian', 'vegan'],
    ['Hypertension-Safe', 'Gut-Health', 'Immune-Boost', 'Detox', 'Traditional'],
    { calories: 19, protein_g: 0.7, carbs_g: 3.7, fat_g: 0.2, fiber_g: 1.1, sugar_g: 2.6, sodium_mg: 105, iron_mg: 0.3, calcium_mg: 24, magnesium_mg: 25, zinc_mg: 0.1, potassium_mg: 250, phosphorus_mg: 20, vitamin_c_mg: 2.4, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 3, selenium_mcg: 0.1, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 54 },
    'Natural oral rehydration solution. 250mg potassium per cup. Used for heat exhaustion, hangover, and gut health across tropical India.'),

  food('sattu_drink', 'Sattu Sherbet', 'Sattu | சத்து மாவு | सत्तू', 'grain', '🥤', ['breakfast', 'snack'], ['vegetarian', 'vegan'],
    ['High-Protein', 'High-Fiber', 'Energy-Dense', 'Diabetic-Friendly', 'Traditional'],
    { calories: 140, protein_g: 8, carbs_g: 23, fat_g: 2.5, fiber_g: 3.5, sugar_g: 2, sodium_mg: 200, iron_mg: 3, calcium_mg: 48, magnesium_mg: 60, zinc_mg: 1.8, potassium_mg: 380, phosphorus_mg: 190, vitamin_c_mg: 0, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 80, selenium_mcg: 5, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 40 },
    'Roasted gram flour drink — Bihar and UP summer staple. Complete protein, high fiber. Instant energy without blood sugar spike.'),
]

// ─── MORE DALS / PREPARATIONS ────────────────────────────────────────────────

const more_dals = [
  food('chana_dal', 'Chana Dal (Split Bengal Gram)', 'Chana Dal | கடலை பருப்பு | चना दाल', 'legume', '💛', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Protein', 'High-Fiber', 'Low-GI', 'Diabetic-Friendly', 'Heart-Healthy', 'Folate-Rich'],
    { calories: 164, protein_g: 8.9, carbs_g: 27.3, fat_g: 2.7, fiber_g: 7.6, sugar_g: 1.5, sodium_mg: 8, iron_mg: 1.9, calcium_mg: 57, magnesium_mg: 48, zinc_mg: 1.5, potassium_mg: 340, phosphorus_mg: 168, vitamin_c_mg: 1, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 172, selenium_mcg: 4, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 27 },
    'Lowest GI legume (27). Split chickpea with outer husk removed. Very high folate (172mcg). Ideal for diabetics and heart health.'),

  food('horse_gram', 'Horse Gram (Kulthi Dal)', 'Kulthi | கொள்ளு | कुलथी', 'legume', '🟤', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Calcium-Rich', 'Weight-Loss', 'Diabetic-Friendly', 'Traditional'],
    { calories: 321, protein_g: 22, carbs_g: 57, fat_g: 0.5, fiber_g: 5.3, sugar_g: 0.5, sodium_mg: 26, iron_mg: 7, calcium_mg: 287, magnesium_mg: 97, zinc_mg: 2.9, potassium_mg: 477, phosphorus_mg: 311, vitamin_c_mg: 1.4, vitamin_a_mcg: 8, vitamin_d_mcg: 0, folate_mcg: 180, selenium_mcg: 5, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 29 },
    'Highest protein legume (22g/100g). Exceptional iron (7mg) and calcium (287mg). Used in South India for weight management and kidney stones.'),

  food('moth_bean', 'Moth Bean (Matki)', 'Matki | மொத்து பயறு | मोठ', 'legume', '🟡', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Diabetic-Friendly', 'Traditional'],
    { calories: 343, protein_g: 22.9, carbs_g: 60, fat_g: 1.6, fiber_g: 8, sugar_g: 0.5, sodium_mg: 37, iron_mg: 8, calcium_mg: 150, magnesium_mg: 190, zinc_mg: 2.7, potassium_mg: 1098, phosphorus_mg: 444, vitamin_c_mg: 1, vitamin_a_mcg: 7, vitamin_d_mcg: 0, folate_mcg: 70, selenium_mcg: 4, iodine_mcg: 0, omega3_g: 0.04, dha_mg: 0, glycemic_index: 38 },
    'Drought-resistant bean of Rajasthan. Extremely high in potassium (1098mg), magnesium, iron, and protein. Sprouts are very nutritious.'),

  food('cowpea', 'Cowpea / Black-Eyed Peas (Lobia)', 'Lobia | காராமணி | लोबिया', 'legume', '⚪', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Protein', 'Folate-Rich', 'Iron-Rich', 'High-Fiber'],
    { calories: 336, protein_g: 23.5, carbs_g: 60.3, fat_g: 1.3, fiber_g: 10.9, sugar_g: 0.5, sodium_mg: 16, iron_mg: 8.3, calcium_mg: 110, magnesium_mg: 184, zinc_mg: 3.4, potassium_mg: 1112, phosphorus_mg: 424, vitamin_c_mg: 1.5, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 630, selenium_mcg: 9.7, iodine_mcg: 0, omega3_g: 0.13, dha_mg: 0, glycemic_index: 33 },
    'Southern Indian bean (Karamani). Highest folate content (630mcg — 315% RDA). Essential for pregnancy nutrition. Very high potassium.'),
]

// ─── POPULAR INDIAN DISHES (more searches) ────────────────────────────────────

const more_dishes = [
  food('curd_rice', 'Curd Rice (Thayir Sadam)', 'Thayir Sadam | தயிர் சாதம் | दही चावल', 'dish', '🍚', ['lunch', 'dinner'], ['vegetarian'],
    ['Gut-Health', 'Probiotic', 'Calcium-Rich', 'Sattvic', 'Traditional'],
    { calories: 135, protein_g: 4.8, carbs_g: 24.2, fat_g: 2.8, fiber_g: 0.5, sugar_g: 2.5, sodium_mg: 220, iron_mg: 0.4, calcium_mg: 118, magnesium_mg: 14, zinc_mg: 0.6, potassium_mg: 175, phosphorus_mg: 115, vitamin_c_mg: 0, vitamin_a_mcg: 15, vitamin_d_mcg: 0, folate_mcg: 9, selenium_mcg: 4.5, iodine_mcg: 5, omega3_g: 0, dha_mg: 0, glycemic_index: 60 },
    'South Indian probiotic meal — rice with cultured curd, tempered with mustard and curry leaves. Promotes gut health and digestion.'),

  food('bisibele_bath', 'Bisibele Bath', 'Bisibele Bath | பிசிபேளே பாத் | बिसिबेले बाथ', 'dish', '🍲', ['lunch', 'dinner'], ['vegetarian'],
    ['High-Protein', 'High-Fiber', 'Iron-Rich', 'Traditional'],
    { calories: 142, protein_g: 5.8, carbs_g: 25, fat_g: 3.2, fiber_g: 3.5, sugar_g: 1, sodium_mg: 320, iron_mg: 1.8, calcium_mg: 45, magnesium_mg: 30, zinc_mg: 0.9, potassium_mg: 280, phosphorus_mg: 110, vitamin_c_mg: 8, vitamin_a_mcg: 75, vitamin_d_mcg: 0, folate_mcg: 55, selenium_mcg: 5, iodine_mcg: 0, omega3_g: 0.08, dha_mg: 0, glycemic_index: 48 },
    'Karnataka one-pot meal: rice, toor dal, vegetables in bisibele bath powder. Complete protein from rice+dal combination.'),

  food('dal_tadka', 'Dal Tadka (Tempered Lentils)', 'Dal Tadka | டால் தட்கா | दाल तड़का', 'dish', '🫕', ['lunch', 'dinner'], ['vegetarian', 'vegan'],
    ['High-Protein', 'Iron-Rich', 'Folate-Rich', 'Heart-Healthy'],
    { calories: 148, protein_g: 9, carbs_g: 22.5, fat_g: 3, fiber_g: 5.5, sugar_g: 1, sodium_mg: 380, iron_mg: 2.8, calcium_mg: 42, magnesium_mg: 38, zinc_mg: 1.2, potassium_mg: 320, phosphorus_mg: 160, vitamin_c_mg: 4, vitamin_a_mcg: 15, vitamin_d_mcg: 0, folate_mcg: 115, selenium_mcg: 4, iodine_mcg: 0, omega3_g: 0.1, dha_mg: 0, glycemic_index: 30 },
    'Restaurant-style yellow dal with ghee tadka. High protein and folate. The ghee tadka increases absorption of fat-soluble vitamins.'),

  food('aloo_paratha', 'Aloo Paratha (Potato Flatbread)', 'Aloo Paratha | ஆலூ பராட்டா | आलू पराठा', 'dish', '🫓', ['breakfast', 'lunch'], ['vegetarian'],
    ['Energy-Dense', 'Traditional'],
    { calories: 280, protein_g: 7.5, carbs_g: 45, fat_g: 8, fiber_g: 3.2, sugar_g: 1, sodium_mg: 340, iron_mg: 1.5, calcium_mg: 35, magnesium_mg: 28, zinc_mg: 0.9, potassium_mg: 380, phosphorus_mg: 110, vitamin_c_mg: 12, vitamin_a_mcg: 3, vitamin_d_mcg: 0, folate_mcg: 28, selenium_mcg: 8, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 55 },
    'North Indian breakfast staple. Whole wheat dough stuffed with spiced potato filling. Vitamin C in potato enhances iron absorption from atta.'),

  food('sabudana_khichdi', 'Sabudana Khichdi (Sago)', 'Sabudana Khichdi | சாகோ கிச்சடி | साबूदाना खिचड़ी', 'dish', '🍚', ['breakfast', 'snack'], ['vegetarian'],
    ['Energy-Dense', 'Gut-Health', 'Traditional'],
    { calories: 195, protein_g: 3, carbs_g: 38, fat_g: 4, fiber_g: 0.5, sugar_g: 0.5, sodium_mg: 180, iron_mg: 0.3, calcium_mg: 12, magnesium_mg: 10, zinc_mg: 0.2, potassium_mg: 110, phosphorus_mg: 28, vitamin_c_mg: 5, vitamin_a_mcg: 0, vitamin_d_mcg: 0, folate_mcg: 6, selenium_mcg: 1, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 85 },
    'Tapioca pearl dish with peanuts and potatoes. Quick energy source. Popular fasting food across Maharashtra, Gujarat and North India.'),

  food('medu_vada', 'Medu Vada (Urad Dal Fritter)', 'Medu Vada | மெது வடை | मेदू वड़ा', 'dish', '🍩', ['breakfast', 'snack'], ['vegetarian'],
    ['High-Protein', 'Traditional'],
    { calories: 212, protein_g: 8.5, carbs_g: 27, fat_g: 8.2, fiber_g: 2.8, sugar_g: 0.5, sodium_mg: 290, iron_mg: 1.8, calcium_mg: 48, magnesium_mg: 35, zinc_mg: 1.2, potassium_mg: 220, phosphorus_mg: 145, vitamin_c_mg: 0, vitamin_a_mcg: 5, vitamin_d_mcg: 0, folate_mcg: 55, selenium_mcg: 4, iodine_mcg: 0, omega3_g: 0.05, dha_mg: 0, glycemic_index: 45 },
    'Crispy deep-fried urad dal fritter. South Indian breakfast alongside sambar and coconut chutney. Complete breakfast with good protein.'),

  food('uttapam', 'Uttapam', 'Uttapam | உத்தப்பம் | उत्तपम', 'dish', '🥞', ['breakfast'], ['vegetarian'],
    ['Probiotic', 'Gut-Health', 'Traditional'],
    { calories: 118, protein_g: 4.2, carbs_g: 21, fat_g: 2.2, fiber_g: 1.8, sugar_g: 1, sodium_mg: 220, iron_mg: 1.2, calcium_mg: 35, magnesium_mg: 22, zinc_mg: 0.8, potassium_mg: 175, phosphorus_mg: 90, vitamin_c_mg: 5, vitamin_a_mcg: 10, vitamin_d_mcg: 0, folate_mcg: 38, selenium_mcg: 3, iodine_mcg: 0, omega3_g: 0.03, dha_mg: 0, glycemic_index: 45 },
    'Thick fermented rice-urad dosa with vegetable toppings. Probiotic benefits from fermentation. Gluten-free.'),

  food('akki_roti', 'Akki Roti (Rice Flour Flatbread)', 'Akki Roti | அக்கி ரொட்டி | अक्की रोटी', 'dish', '🫓', ['breakfast', 'lunch'], ['vegetarian', 'vegan'],
    ['Gluten-Free', 'Traditional'],
    { calories: 178, protein_g: 3.2, carbs_g: 38, fat_g: 1.5, fiber_g: 1.5, sugar_g: 0.5, sodium_mg: 180, iron_mg: 0.8, calcium_mg: 12, magnesium_mg: 18, zinc_mg: 0.5, potassium_mg: 90, phosphorus_mg: 80, vitamin_c_mg: 2, vitamin_a_mcg: 5, vitamin_d_mcg: 0, folate_mcg: 15, selenium_mcg: 4, iodine_mcg: 0, omega3_g: 0, dha_mg: 0, glycemic_index: 55 },
    'Karnataka breakfast flatbread made from rice flour with onion, green chilli, and coconut. Naturally gluten-free.'),
]

const indianFoods = [
  ...fruits,
  ...more_fruits,
  ...vegetables,
  ...more_vegetables,
  ...legumes,
  ...more_dals,
  ...nuts_seeds,
  ...fermented,
  ...grains,
  ...rice_varieties,
  ...dairy,
  ...spices,
  ...meats_fish,
  ...oils,
  ...beverages,
  ...more_beverages,
  ...millets,
  ...traditional_dishes,
  ...more_dishes,
  ...herbs,
]

export default indianFoods
