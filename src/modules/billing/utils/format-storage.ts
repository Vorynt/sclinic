/**
 * Formats byte counts for plan storage quotas (pt-BR).
 */
export function formatStorageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`

  const units = ["KB", "MB", "GB", "TB"] as const
  let value = bytes
  let unitIndex = -1

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const digits = value >= 10 || Number.isInteger(value) ? 0 : 1
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  })} ${units[unitIndex]}`
}
