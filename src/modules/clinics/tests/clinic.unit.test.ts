import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { createClinicSchema } from "@/modules/clinics/schemas/clinic.schema"

describe("createClinicSchema", () => {
  it("accepts required name and planId", () => {
    const parsed = createClinicSchema.parse({
      name: " Clínica Alpha ",
      planId: "11111111-1111-4111-8111-111111111111",
    })
    assert.equal(parsed.name, "Clínica Alpha")
    assert.equal(parsed.planId, "11111111-1111-4111-8111-111111111111")
  })

  it("rejects missing name", () => {
    const result = createClinicSchema.safeParse({
      name: "",
      planId: "11111111-1111-4111-8111-111111111111",
    })
    assert.equal(result.success, false)
  })

  it("rejects invalid planId", () => {
    const result = createClinicSchema.safeParse({
      name: "Clínica",
      planId: "not-a-uuid",
    })
    assert.equal(result.success, false)
  })

  it("uppercases UF and drops empty optionals", () => {
    const parsed = createClinicSchema.parse({
      name: "Clínica",
      planId: "11111111-1111-4111-8111-111111111111",
      addressState: "sp",
      tradeName: "   ",
      email: "",
    })
    assert.equal(parsed.addressState, "SP")
    assert.equal(parsed.tradeName, undefined)
    assert.equal(parsed.email, undefined)
  })
})
