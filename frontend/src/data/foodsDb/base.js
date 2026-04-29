/**
 * Compact food row transformer — converts minimal arrays into full food objects.
 *
 * Row format (14 fields):
 * [id, nameEn, nameRegional, category, emoji,
 *  kcal, protein_g, carbs_g, fat_g, fiber_g, glycemicIndex,
 *  dietCode, mealCode, tagCodes]
 *
 * Diet: v=vegetarian  vg=vegan  nv=non-veg  j=jain  e=eggetarian  s=sattvic
 * Meal: b=breakfast  l=lunch  d=dinner  s=snack  a=all-meals
 *       bl  ld  bd  bs  ls  ds  bld  blds
 * Tags (space-separated):
 *   HP HF IR CR LF LS IM AI DF LG HH WL ED O3 MR ZR FR TR ST GU PR BO BC
 *   DT MB PC HT VD B12 SE TY GF FS AY
 */

const DIET_EXP = {
  v:   ['vegetarian'],
  vg:  ['vegetarian', 'vegan'],
  nv:  ['non-vegetarian'],
  j:   ['jain', 'vegetarian'],
  e:   ['eggetarian'],
  s:   ['sattvic', 'vegetarian'],
}

const MEAL_EXP = {
  b:    ['breakfast'],
  l:    ['lunch'],
  d:    ['dinner'],
  s:    ['snack'],
  a:    ['breakfast', 'lunch', 'dinner', 'snack'],
  bl:   ['breakfast', 'lunch'],
  ld:   ['lunch', 'dinner'],
  bd:   ['breakfast', 'dinner'],
  bs:   ['breakfast', 'snack'],
  ls:   ['lunch', 'snack'],
  ds:   ['dinner', 'snack'],
  bld:  ['breakfast', 'lunch', 'dinner'],
  blds: ['breakfast', 'lunch', 'dinner', 'snack'],
}

const TAG_EXP = {
  HP: 'High-Protein',       HF: 'High-Fiber',        IR: 'Iron-Rich',
  CR: 'Calcium-Rich',       LF: 'Low-Fat',            LS: 'Low-Sodium',
  IM: 'Immune-Boost',       AI: 'Anti-Inflammatory',  DF: 'Diabetic-Friendly',
  LG: 'Low-GI',             HH: 'Heart-Healthy',      WL: 'Weight-Loss',
  ED: 'Energy-Dense',       O3: 'Omega-3-Rich',       MR: 'Magnesium-Rich',
  ZR: 'Zinc-Rich',          FR: 'Folate-Rich',        TR: 'Traditional',
  ST: 'Sattvic',            GU: 'Gut-Health',         PR: 'Probiotic',
  BO: 'Bone-Health',        BC: 'Brain-Health',       DT: 'Detox',
  MB: 'Muscle-Building',    PC: 'PCOD-Friendly',      HT: 'Hypertension-Safe',
  VD: 'Vitamin-D-Rich',     B12: 'B12-Rich',          SE: 'Selenium-Rich',
  TY: 'Thyroid-Support',    GF: 'Gluten-Free',        FS: 'Festival',
  AY: 'Ayurvedic',
}

// Per-category micronutrient defaults (used when not specified in row)
const CAT_DEF = {
  fruit:     { na:3,   ca:12,  fe:0.3,  vc:20,  va:15,  mg:12,  potk:200, fol:15,  se:0.5 },
  vegetable: { na:10,  ca:40,  fe:1.0,  vc:25,  va:50,  mg:20,  potk:250, fol:40,  se:0.5 },
  legume:    { na:15,  ca:60,  fe:3.5,  vc:2,   va:5,   mg:50,  potk:400, fol:120, se:4   },
  grain:     { na:5,   ca:30,  fe:2.0,  vc:0,   va:0,   mg:80,  potk:200, fol:25,  se:15  },
  millet:    { na:5,   ca:35,  fe:3.0,  vc:0,   va:0,   mg:110, potk:195, fol:20,  se:3   },
  nut_seed:  { na:5,   ca:80,  fe:3.0,  vc:2,   va:0,   mg:150, potk:350, fol:40,  se:8   },
  spice:     { na:20,  ca:100, fe:5.0,  vc:10,  va:50,  mg:80,  potk:400, fol:30,  se:3   },
  herb:      { na:15,  ca:150, fe:3.5,  vc:30,  va:200, mg:60,  potk:350, fol:60,  se:2   },
  dairy:     { na:50,  ca:200, fe:0.1,  vc:1,   va:50,  mg:15,  potk:150, fol:10,  se:3   },
  meat:      { na:70,  ca:12,  fe:2.5,  vc:0,   va:10,  mg:22,  potk:300, fol:10,  se:20  },
  fish:      { na:60,  ca:30,  fe:1.5,  vc:1,   va:20,  mg:28,  potk:350, fol:15,  se:40  },
  dish:      { na:250, ca:35,  fe:1.5,  vc:5,   va:30,  mg:25,  potk:200, fol:30,  se:5   },
  beverage:  { na:20,  ca:20,  fe:0.2,  vc:10,  va:10,  mg:10,  potk:150, fol:5,   se:0.5 },
  sweet:     { na:100, ca:50,  fe:0.8,  vc:1,   va:20,  mg:15,  potk:100, fol:10,  se:2   },
  fermented: { na:200, ca:40,  fe:0.5,  vc:2,   va:10,  mg:15,  potk:200, fol:15,  se:2   },
  oil:       { na:0,   ca:0,   fe:0,    vc:0,   va:0,   mg:0,   potk:0,   fol:0,   se:0   },
  snack:     { na:300, ca:40,  fe:1.5,  vc:3,   va:20,  mg:30,  potk:180, fol:20,  se:5   },
  bread:     { na:350, ca:30,  fe:2.0,  vc:0,   va:0,   mg:25,  potk:120, fol:30,  se:10  },
  seafood:   { na:65,  ca:35,  fe:1.5,  vc:1,   va:20,  mg:28,  potk:350, fol:15,  se:38  },
  egg:       { na:125, ca:50,  fe:1.8,  vc:0,   va:80,  mg:10,  potk:130, fol:50,  se:15  },
  condiment: { na:600, ca:20,  fe:0.5,  vc:5,   va:15,  mg:10,  potk:100, fol:5,   se:1   },
}

function calcHS(pro, fib, sugar, satFat, sodium) {
  return Math.min(100, Math.round(
    (Math.min(fib / 28, 1) * 20) +
    (Math.min(pro / 50, 1) * 20) +
    (Math.max(0, 1 - sugar / 50) * 20) +
    (Math.max(0, 1 - satFat / 20) * 20) +
    (Math.max(0, 1 - sodium / 2300) * 20)
  ))
}

let _seq = 1

export function makeFoods(rows) {
  return rows.map(([id, nameEn, nameRegional, cat, emoji, kcal, pro, carb, fat, fib, gi, diet, meal, tagStr]) => {
    if (!id || !nameEn) return null

    const dietTypes = DIET_EXP[diet]  || ['vegetarian']
    const mealTypes = MEAL_EXP[meal]  || ['lunch', 'dinner']
    const tags      = (tagStr || '').split(' ').filter(Boolean).map(t => TAG_EXP[t]).filter(Boolean)
    const def       = CAT_DEF[cat]    || CAT_DEF.dish
    const sugar     = Math.round(carb * 0.15 * 10) / 10
    const satFat    = Math.round(fat  * 0.3  * 10) / 10

    const seq = _seq++

    return {
      id:             `cf_${id}`,
      name:           nameEn,
      name_regional:  nameRegional || nameEn,
      category:       cat,
      food_emoji:     emoji || '🍽️',
      source:         'food_item',
      description:    '',
      image_url:      null,
      meal_type:      mealTypes,
      diet_type:      dietTypes,
      region:         'india',
      state:          'India',
      cuisine_tags:   ['indian', cat],
      health_tags:    tags,
      ayurveda_type:  'sattvic',
      season_tags:    ['all-year'],
      festival_tags:  [],
      health_score:   calcHS(pro, fib, sugar, satFat, def.na),
      rating:         3.8 + (seq % 12) * 0.1,
      reviews:        80 + (seq % 500),
      prep_time_mins: 0,
      cook_time_mins: 0,
      servings:       1,
      steps:          [],
      ingredients:    [],
      nutrition: {
        calories:        Math.round(kcal),
        protein_g:       pro,
        carbs_g:         carb,
        fat_g:           fat,
        fiber_g:         fib,
        sugar_g:         sugar,
        saturated_fat_g: satFat,
        trans_fat_g:     0,
        sodium_mg:       def.na,
        cholesterol_mg:  dietTypes.includes('non-vegetarian') ? 60 : 0,
        potassium_mg:    def.potk,
        calcium_mg:      def.ca,
        iron_mg:         def.fe,
        vitamin_c_mg:    def.vc,
        vitamin_a_mcg:   def.va,
        magnesium_mg:    def.mg,
        zinc_mg:         Math.round(pro * 0.1 * 10) / 10 || 0.5,
        phosphorus_mg:   Math.round(pro * 12) || 80,
        folate_mcg:      def.fol,
        vitamin_d_mcg:   cat === 'fish' ? 8 : cat === 'dairy' ? 0.5 : 0,
        vitamin_b12_mcg: (cat === 'meat' || cat === 'fish' || cat === 'dairy') ? 0.5 : 0,
        omega3_g:        cat === 'fish' ? 1.0 : cat === 'nut_seed' ? 0.5 : 0.02,
        glycemic_index:  gi || 55,
        serving_size_g:  100,
      },
    }
  }).filter(Boolean)
}
