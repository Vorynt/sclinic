import { describe, expect, it } from "@jest/globals"

import { getGreetingFirstName } from "@/modules/dashboard/utils/greeting-name"

describe("getGreetingFirstName", () => {
  it("returns the first given name", () => {
    expect(getGreetingFirstName("Ana Beatriz")).toBe("Ana")
  })

  it("skips treatment pronouns", () => {
    expect(getGreetingFirstName("Dr. Carlos Eduardo")).toBe("Carlos")
    expect(getGreetingFirstName("Dra. Ana Beatriz")).toBe("Ana")
    expect(getGreetingFirstName("Enf. Marina")).toBe("Marina")
  })

  it("is case-insensitive for pronouns", () => {
    expect(getGreetingFirstName("DR. João")).toBe("João")
    expect(getGreetingFirstName("dra Ana")).toBe("Ana")
  })

  it("falls back when name is empty or only a pronoun", () => {
    expect(getGreetingFirstName("")).toBe("olá")
    expect(getGreetingFirstName(null)).toBe("olá")
    expect(getGreetingFirstName("Dr.")).toBe("olá")
    expect(getGreetingFirstName("   ")).toBe("olá")
  })
})
