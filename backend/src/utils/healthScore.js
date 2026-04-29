/**
 * Health score formula (0–100) — weighted from PRD spec
 * Uses per-100g nutrition values
 */
function calcHealthScore(n) {
  if (!n) return 50

  const fiber   = Math.min(n.fiber_g    || 0, 28)   / 28   * 15
  const protein = Math.min(n.protein_g  || 0, 50)   / 50   * 20
  const vitC    = Math.min(n.vitamin_c_mg || 0, 90)  / 90   * 10
  const iron    = Math.min(n.iron_mg    || 0, 17)   / 17   * 10
  const calcium = Math.min(n.calcium_mg || 0, 800)  / 800  * 10

  // Penalties
  const saturPenalty = Math.min((n.saturated_fat_g || 0) / 20, 1) * 10
  const sugarPenalty = Math.min((n.sugar_g || 0) / 50, 1)         * 10
  const sodPenalty   = Math.min((n.sodium_mg || 0) / 2300, 1)     * 5

  const score = fiber + protein + vitC + iron + calcium - saturPenalty - sugarPenalty - sodPenalty + 20
  return Math.max(0, Math.min(100, Math.round(score)))
}

module.exports = { calcHealthScore }
