/** BMI from kg and cm; null when either value is missing or height is zero. */
export function calculateBmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined,
): number | null {
  if (weightKg == null || heightCm == null || heightCm <= 0) return null
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  if (!Number.isFinite(bmi)) return null
  return Math.round(bmi * 10) / 10
}
