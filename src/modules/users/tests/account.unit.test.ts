import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { updateAccountProfileSchema } from "@/modules/users/schemas/account.schema"

describe("updateAccountProfileSchema", () => {
  it("accepts name and optional phone", () => {
    const parsed = updateAccountProfileSchema.parse({
      name: "Ana Silva",
      phone: "11999998888",
    })

    assert.equal(parsed.name, "Ana Silva")
    assert.equal(parsed.phone, "11999998888")
  })

  it("normalizes empty phone to null", () => {
    const parsed = updateAccountProfileSchema.parse({
      name: "Ana Silva",
      phone: "   ",
    })

    assert.equal(parsed.phone, null)
  })

  it("rejects short phone when provided", () => {
    assert.throws(() =>
      updateAccountProfileSchema.parse({
        name: "Ana Silva",
        phone: "123",
      }),
    )
  })

  it("rejects empty name", () => {
    assert.throws(() =>
      updateAccountProfileSchema.parse({
        name: "  ",
      }),
    )
  })
})