const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function formatCentsToBrl(cents: number): string {
  return brlFormatter.format(cents / 100)
}

/** Strip optional `R$` prefix left by masked/display values. */
function stripBrlSymbol(value: string): string {
  return value.trim().replace(/^R\$\s?/i, "").trim()
}

/**
 * True when the money field should be treated as blank (optional charge).
 * Covers empty, masked zeros (`0,00`), and autoUnmask zeros (`0` / `0.00`).
 */
export function isEmptyMoneyInput(value: string): boolean {
  const cleaned = stripBrlSymbol(value)
  if (!cleaned) return true

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned

  const amount = Number(normalized)
  return !Number.isFinite(amount) || amount === 0
}

/** Parse a Brazilian-style money string (e.g. "150,50" or "150.50") to cents. */
export function parseBrlToCents(value: string): number | null {
  const cleaned = stripBrlSymbol(value)
  if (!cleaned) return null

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned

  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0) return null

  return Math.round(amount * 100)
}
