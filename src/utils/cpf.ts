/** Digits only (removes mask). */
export function stripCpf(cpf: string): string {
  return cpf.replace(/\D/g, "")
}

/**
 * Validates a Brazilian CPF (with or without mask).
 * Rejects repeated digits and invalid check digits.
 */
export function isValidCpf(cpf: string): boolean {
  const digits = stripCpf(cpf)

  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  const calcCheckDigit = (base: string, factor: number): number => {
    let sum = 0
    for (let i = 0; i < base.length; i += 1) {
      sum += Number(base[i]) * (factor - i)
    }
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const d1 = calcCheckDigit(digits.slice(0, 9), 10)
  if (d1 !== Number(digits[9])) return false

  const d2 = calcCheckDigit(digits.slice(0, 10), 11)
  return d2 === Number(digits[10])
}

export function formatCpf(cpf: string): string {
  const digits = stripCpf(cpf)
  if (digits.length !== 11) return cpf
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}
