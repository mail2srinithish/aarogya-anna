/**
 * Health calculations based on ICMR-NIN 2020 guidelines
 */

export function calcBMI(weightKg, heightCm) {
  const heightM = heightCm / 100
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1))
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50', position: 15 }
  if (bmi < 23) return { label: 'Normal / Healthy', color: 'text-primary', bg: 'bg-primary/10', position: 40 }
  if (bmi < 25) return { label: 'Overweight', color: 'text-secondary', bg: 'bg-secondary/10', position: 62 }
  if (bmi < 30) return { label: 'Obese I', color: 'text-error', bg: 'bg-error/10', position: 78 }
  return { label: 'Obese II', color: 'text-error', bg: 'bg-error/10', position: 92 }
}

/** Mifflin-St Jeor formula (Indian-adjusted per ICMR-NIN 2020) */
export function calcBMR(age, gender, weightKg, heightCm) {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)
}

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calcTDEE(bmr, activityLevel = 'moderate') {
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55))
}

export function getIdealWeightRange(heightCm, gender) {
  const heightM = heightCm / 100
  const lower = parseFloat((18.5 * heightM * heightM).toFixed(1))
  const upper = parseFloat((22.9 * heightM * heightM).toFixed(1))
  return { lower, upper }
}

export function calcBodyFatEstimate(bmi, age, gender) {
  // Deurenberg formula
  const factor = gender === 'male' ? 1 : 0
  return parseFloat((1.2 * bmi + 0.23 * age - 10.8 * factor - 5.4).toFixed(1))
}
