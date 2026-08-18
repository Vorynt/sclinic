export const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/

export type Rgb = { r: number; g: number; b: number }
export type Hsv = { h: number; s: number; v: number }
export type Hsl = { h: number; s: number; l: number }
export type ColorFormat = "hex" | "rgb" | "hsl"

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function normalizeHex(raw: string): string | null {
  const trimmed = raw.trim()
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
  return HEX_COLOR_RE.test(withHash) ? withHash.toLowerCase() : null
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex) ?? "#000000"
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (channel: number) =>
    Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6
    else if (max === green) h = (blue - red) / delta + 2
    else h = (red - green) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s: max === 0 ? 0 : delta / max, v: max }
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const hue = ((h % 360) + 360) % 360
  const chroma = v * s
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = v - chroma

  let red = 0
  let green = 0
  let blue = 0
  if (hue < 60) {
    red = chroma
    green = x
  } else if (hue < 120) {
    red = x
    green = chroma
  } else if (hue < 180) {
    green = chroma
    blue = x
  } else if (hue < 240) {
    green = x
    blue = chroma
  } else if (hue < 300) {
    red = x
    blue = chroma
  } else {
    red = chroma
    blue = x
  }

  return {
    r: (red + m) * 255,
    g: (green + m) * 255,
    b: (blue + m) * 255,
  }
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const l = (max + min) / 2
  const delta = max - min

  if (delta === 0) return { h: 0, s: 0, l }

  const s = delta / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (max === red) h = ((green - blue) / delta) % 6
  else if (max === green) h = (blue - red) / delta + 2
  else h = (red - green) / delta + 4
  h *= 60
  if (h < 0) h += 360

  return { h, s, l }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hue = ((h % 360) + 360) % 360
  const chroma = (1 - Math.abs(2 * l - 1)) * s
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - chroma / 2

  let red = 0
  let green = 0
  let blue = 0
  if (hue < 60) {
    red = chroma
    green = x
  } else if (hue < 120) {
    red = x
    green = chroma
  } else if (hue < 180) {
    green = chroma
    blue = x
  } else if (hue < 240) {
    green = x
    blue = chroma
  } else if (hue < 300) {
    red = x
    blue = chroma
  } else {
    red = chroma
    blue = x
  }

  return {
    r: (red + m) * 255,
    g: (green + m) * 255,
    b: (blue + m) * 255,
  }
}

export function hexToHsv(hex: string): Hsv {
  return rgbToHsv(hexToRgb(hex))
}

export function hsvToHex(hsv: Hsv): string {
  return rgbToHex(hsvToRgb(hsv))
}

export function formatColor(hex: string, format: ColorFormat): string {
  const rgb = hexToRgb(hex)
  if (format === "hex") return rgbToHex(rgb).toUpperCase()
  if (format === "rgb") {
    return `${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)}`
  }
  const hsl = rgbToHsl(rgb)
  return `${Math.round(hsl.h)} ${Math.round(hsl.s * 100)}% ${Math.round(hsl.l * 100)}%`
}

export function parseColorInput(
  raw: string,
  format: ColorFormat,
): string | null {
  if (format === "hex") return normalizeHex(raw)

  const nums = raw.match(/-?\d+(\.\d+)?/g)?.map(Number)
  if (!nums || nums.length < 3) return null

  const [first, second, third] = nums
  if (
    first === undefined ||
    second === undefined ||
    third === undefined ||
    !Number.isFinite(first) ||
    !Number.isFinite(second) ||
    !Number.isFinite(third)
  ) {
    return null
  }

  if (format === "rgb") {
    return rgbToHex({ r: first, g: second, b: third })
  }

  return rgbToHex(
    hslToRgb({
      h: first,
      s: clamp(second / 100, 0, 1),
      l: clamp(third / 100, 0, 1),
    }),
  )
}

export function hueCss(hue: number): string {
  return `hsl(${Math.round(((hue % 360) + 360) % 360)} 100% 50%)`
}
