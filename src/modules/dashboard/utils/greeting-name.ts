const HONORIFIC_TOKENS = new Set([
  "dr",
  "dr.",
  "dra",
  "dra.",
  "sr",
  "sr.",
  "sra",
  "sra.",
  "prof",
  "prof.",
  "profa",
  "profa.",
  "enf",
  "enf.",
  "enfa",
  "enfa.",
])

/**
 * First name for greetings, skipping treatment pronouns (Dr., Dra., etc.).
 * Falls back to the first non-empty token, or "olá".
 */
export function getGreetingFirstName(fullName: string | null | undefined): string {
  const tokens = fullName?.trim().split(/\s+/).filter(Boolean) ?? []
  for (const token of tokens) {
    if (!HONORIFIC_TOKENS.has(token.toLowerCase())) {
      return token
    }
  }
  return "olá"
}
