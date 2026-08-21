/** Digits-only CEP (Brazilian postal code). */
export function toZipDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function isCompleteZip(value: string): boolean {
  return toZipDigits(value).length === 8
}
