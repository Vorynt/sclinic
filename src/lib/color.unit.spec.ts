import { describe, expect, it } from "@jest/globals"

import {
  hsvToHex,
  hexToHsv,
  normalizeHex,
  parseColorInput,
  rgbToHex,
} from "@/lib/color"

describe("normalizeHex", () => {
  it("accepts 6-digit hex with or without hash", () => {
    expect(normalizeHex("#1e4d6b")).toBe("#1e4d6b")
    expect(normalizeHex("1E4D6B")).toBe("#1e4d6b")
  })

  it("rejects short or named colors", () => {
    expect(normalizeHex("#fff")).toBeNull()
    expect(normalizeHex("red")).toBeNull()
  })
})

describe("hsv hex roundtrip", () => {
  it("keeps saturated colors stable", () => {
    const hex = "#6366f1"
    expect(hsvToHex(hexToHsv(hex))).toBe(hex)
  })
})

describe("format and parse", () => {
  it("parses hex, rgb and hsl back to hex", () => {
    expect(parseColorInput("#6366F1", "hex")).toBe("#6366f1")
    expect(parseColorInput("99 102 241", "rgb")).toBe(
      rgbToHex({ r: 99, g: 102, b: 241 }),
    )
    expect(parseColorInput("239 81% 66%", "hsl")).toMatch(/^#[0-9a-f]{6}$/)
  })
})
