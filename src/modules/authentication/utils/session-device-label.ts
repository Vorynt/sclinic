/**
 * Compact, user-facing label from a User-Agent string.
 * Falls back to a generic device name when the UA is missing or unknown.
 */
export function sessionDeviceLabel(
  userAgent: string | null | undefined,
): string {
  if (!userAgent || userAgent.trim() === "") {
    return "Dispositivo desconhecido"
  }

  const ua = userAgent
  const os = ua.includes("Android")
    ? "Android"
    : ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iOS")
      ? "iOS"
      : ua.includes("Mac OS") || ua.includes("Macintosh")
        ? "macOS"
        : ua.includes("Windows")
          ? "Windows"
          : ua.includes("Linux")
            ? "Linux"
            : null

  const browser = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("Chrome/") && !ua.includes("Edg/")
      ? "Chrome"
      : ua.includes("Firefox/")
        ? "Firefox"
        : ua.includes("Safari/") && !ua.includes("Chrome/")
          ? "Safari"
          : null

  if (browser && os) return `${browser} · ${os}`
  if (browser) return browser
  if (os) return os
  return "Dispositivo desconhecido"
}
