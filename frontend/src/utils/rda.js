/**
 * ICMR-NIN 2020 Recommended Dietary Allowances for Indians
 * Reference: https://www.nin.res.in/rdabook/brief_note.pdf
 */

const RDA_BASE = {
  // Macronutrients
  calories: 2000,
  protein_g: 0.83, // per kg body weight; default 50g for 60kg adult
  carbs_g: 250,
  fat_g: 65,
  fiber_g: 28,
  sugar_g: 50,
  saturated_fat_g: 20,

  // Micronutrients
  sodium_mg: 2000,
  potassium_mg: 3500,
  calcium_mg: 1000,
  iron_mg: 17,       // female RDA (higher)
  magnesium_mg: 350,
  zinc_mg: 10,
  phosphorus_mg: 700,
  vitamin_a_mcg: 600,
  vitamin_c_mg: 80,
  vitamin_d_mcg: 15,
  vitamin_b12_mcg: 2.2,
  folate_mcg: 400,
  iodine_mcg: 150,
  selenium_mcg: 40,

  // Fatty acids (ICMR-NIN 2020 / WHO)
  omega3_g: 1.2,     // ALA — female default (male: 1.6g)
  omega6_g: 12,      // LA — female default (male: 17g)
  dha_mg: 250,       // DHA (WHO: 200–500 mg/day EPA+DHA)
  epa_mg: 250,       // EPA
}

const RDA_ADJUSTMENTS = {
  // Female adjustments
  female: { iron_mg: 21, calcium_mg: 1000, folate_mcg: 400 },
  // Male adjustments
  male: { iron_mg: 17, calcium_mg: 1000, omega3_g: 1.6, omega6_g: 17 },
  // Diabetes
  diabetes: { sugar_g: 25, carbs_g: 200, fiber_g: 35 },
  // Hypertension
  hypertension: { sodium_mg: 1500 },
  // Pregnancy
  pregnancy: { iron_mg: 35, folate_mcg: 600, calcium_mg: 1200 },
}

export function getRDA(profile = {}) {
  const rda = { ...RDA_BASE }
  const { age = 30, gender = 'female', weightKg = 60, healthConditions = [] } = profile

  // Protein based on body weight
  rda.protein_g = Math.round(0.83 * weightKg)

  // Calories based on TDEE if available
  if (profile.tdee) rda.calories = profile.tdee

  // Gender adjustments
  if (RDA_ADJUSTMENTS[gender]) Object.assign(rda, RDA_ADJUSTMENTS[gender])

  // Health condition adjustments
  healthConditions.forEach((cond) => {
    if (RDA_ADJUSTMENTS[cond]) Object.assign(rda, RDA_ADJUSTMENTS[cond])
  })

  return rda
}

export function getRDAPercent(nutrient, amount, profile) {
  const rda = getRDA(profile)
  const target = rda[nutrient]
  if (!target || !amount) return 0
  return Math.round((amount / target) * 100)
}

export const NUTRIENT_LABELS = {
  calories: 'Calories',
  protein_g: 'Protein',
  carbs_g: 'Total Carbohydrates',
  fat_g: 'Total Fat',
  fiber_g: 'Dietary Fiber',
  sugar_g: 'Total Sugar',
  saturated_fat_g: 'Saturated Fat',
  trans_fat_g: 'Trans Fat',
  cholesterol_mg: 'Cholesterol',
  sodium_mg: 'Sodium',
  potassium_mg: 'Potassium',
  calcium_mg: 'Calcium',
  iron_mg: 'Iron',
  magnesium_mg: 'Magnesium',
  zinc_mg: 'Zinc',
  phosphorus_mg: 'Phosphorus',
  vitamin_a_mcg: 'Vitamin A',
  vitamin_c_mg: 'Vitamin C',
  vitamin_d_mcg: 'Vitamin D',
  vitamin_b12_mcg: 'Vitamin B12',
  folate_mcg: 'Folate (B9)',
  iodine_mcg: 'Iodine',
  selenium_mcg: 'Selenium',
  omega3_g: 'Omega-3 (ALA)',
  omega6_g: 'Omega-6 (LA)',
  dha_mg: 'DHA',
  epa_mg: 'EPA',
}

export const NUTRIENT_UNITS = {
  calories: 'kcal', protein_g: 'g', carbs_g: 'g', fat_g: 'g',
  fiber_g: 'g', sugar_g: 'g', saturated_fat_g: 'g', trans_fat_g: 'g',
  cholesterol_mg: 'mg', sodium_mg: 'mg', potassium_mg: 'mg',
  calcium_mg: 'mg', iron_mg: 'mg', magnesium_mg: 'mg', zinc_mg: 'mg',
  phosphorus_mg: 'mg', vitamin_a_mcg: 'mcg', vitamin_c_mg: 'mg',
  vitamin_d_mcg: 'mcg', vitamin_b12_mcg: 'mcg', folate_mcg: 'mcg',
  iodine_mcg: 'mcg', selenium_mcg: 'mcg',
  omega3_g: 'g', omega6_g: 'g', dha_mg: 'mg', epa_mg: 'mg',
}
