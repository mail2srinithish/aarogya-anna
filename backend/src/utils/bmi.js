/**
 * BMI / BMR / TDEE calculations — Mifflin-St Jeor equation
 */

function calcBMI(weight_kg, height_cm) {
  const h = height_cm / 100
  return Math.round((weight_kg / (h * h)) * 10) / 10
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 23)   return 'Normal (Asian)'   // WHO Asian cutoff
  if (bmi < 27.5) return 'Overweight (Asian)'
  return 'Obese (Asian)'
}

function calcBMR(age, gender, weight_kg, height_cm) {
  // Mifflin-St Jeor
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return Math.round(gender === 'female' ? base - 161 : base + 5)
}

const ACTIVITY_MULTIPLIERS = {
  sedentary:  1.2,
  light:      1.375,
  moderate:   1.55,
  active:     1.725,
  very_active:1.9,
}

function calcTDEE(bmr, activity_level) {
  const mult = ACTIVITY_MULTIPLIERS[activity_level] || 1.55
  return Math.round(bmr * mult)
}

function idealWeightRange(height_cm, gender) {
  // Devine formula (adjusted for Indian population)
  const h_in = height_cm / 2.54
  const base  = gender === 'female' ? 45.5 : 50
  const ideal = base + 2.3 * (h_in - 60)
  return { min: Math.round(ideal * 0.9), max: Math.round(ideal * 1.1) }
}

module.exports = { calcBMI, getBMICategory, calcBMR, calcTDEE, idealWeightRange }
