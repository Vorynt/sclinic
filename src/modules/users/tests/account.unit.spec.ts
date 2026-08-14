import { describe, expect, it } from "@jest/globals"

import { updateAccountProfileSchema } from "@/modules/users/schemas/account.schema"

describe("updateAccountProfileSchema", () => {
  it("accepts name and optional phone", () => {
    const parsed = updateAccountProfileSchema.parse({
      name: "Ana Silva",
      phone: "11999998888",
    })

    expect(parsed.name).toBe("Ana Silva")
    expect(parsed.phone).toBe("11999998888")
  })

  it("normalizes empty phone to null", () => {
    const parsed = updateAccountProfileSchema.parse({
      name: "Ana Silva",
      phone: "   ",
    })

    expect(parsed.phone).toBe(null)
  })

  it("rejects short phone when provided", () => {
    expect(() => updateAccountProfileSchema.parse({
              name: "Ana Silva",
              phone: "123",
            })).toThrow()
  })

  it("rejects empty name", () => {
    expect(() => updateAccountProfileSchema.parse({
              name: "  ",
            })).toThrow()
  })
})