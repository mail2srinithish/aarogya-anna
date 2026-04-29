/**
 * Health Score calculation (0–100) per PRD formula
 */
export function calcHealthScore(nutrition) {
  if (!nutrition) return 0
  const { calories = 0, protein_g = 0, fiber_g = 0, sugar_g = 0, saturated_fat_g = 0,
    vitamin_c_mg = 0, iron_mg = 0, calcium_mg = 0 } = nutrition

  // Score each nutrient out of 100
  const fiberScore = Math.min(100, (fiber_g / 10) * 100)
  const proteinScore = Math.min(100, (protein_g / 30) * 100)
  const lowSugarScore = Math.max(0, 100 - (sugar_g / 50) * 100)
  const lowSatFatScore = Math.max(0, 100 - (saturated_fat_g / 20) * 100)
  const microScore = Math.min(100, ((vitamin_c_mg / 80) + (iron_mg / 17) + (calcium_mg / 1000)) / 3 * 100)

  return Math.round(
    fiberScore * 0.2 +
    proteinScore * 0.25 +
    lowSugarScore * 0.2 +
    lowSatFatScore * 0.15 +
    microScore * 0.2
  )
}

export function getGILabel(gi) {
  if (!gi) return { label: 'N/A', color: 'text-on-surface-variant', badge: 'bg-surface-container' }
  if (gi <= 55) return { label: 'Low GI', color: 'text-primary', badge: 'bg-primary/10' }
  if (gi <= 69) return { label: 'Medium GI', color: 'text-secondary', badge: 'bg-secondary/10' }
  return { label: 'High GI', color: 'text-error', badge: 'bg-error/10' }
}

export function getHealthCompatibility(recipe, profile) {
  if (!profile?.healthConditions?.length) return []
  const warnings = []
  const safe = []
  const { healthConditions = [], allergies = [] } = profile
  const { nutrition, health_tags = [], ingredients = [] } = recipe

  if (healthConditions.includes('diabetes')) {
    if (nutrition?.glycemic_index && nutrition.glycemic_index > 70) {
      warnings.push({ icon: 'warning', msg: 'High GI — limit portions for diabetes management' })
    } else if (nutrition?.glycemic_index && nutrition.glycemic_index <= 55) {
      safe.push({ icon: 'check_circle', msg: 'Low GI — suitable for diabetes management' })
    }
    if (nutrition?.sugar_g > 15) {
      warnings.push({ icon: 'warning', msg: `High sugar (${nutrition.sugar_g}g) — watch portion size` })
    }
  }

  if (healthConditions.includes('hypertension') && nutrition?.sodium_mg > 600) {
    warnings.push({ icon: 'warning', msg: `High sodium (${nutrition.sodium_mg}mg) — limit for hypertension` })
  }

  if (health_tags.some((t) => t.includes('diabetic-friendly'))) {
    safe.push({ icon: 'check_circle', msg: 'Marked diabetic-friendly by nutritionists' })
  }

  return { warnings, safe }
}
