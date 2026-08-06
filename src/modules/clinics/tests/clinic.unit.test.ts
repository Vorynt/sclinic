import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  createClinicSchema,
  toClinicCreateFields,
  toOwnerClinicalProfileFields,
} from "@/modules/clinics/schemas/clinic.schema"

const PLAN_ID = "11111111-1111-4111-8111-111111111111"

describe("createClinicSchema", () => {
  it("accepts required name and planId", () => {
    const parsed = createClinicSchema.parse({
      name: " Clínica Alpha ",
      planId: PLAN_ID,
    })
    assert.equal(parsed.name, "Clínica Alpha")
    assert.equal(parsed.planId, PLAN_ID)
    assert.equal(parsed.alsoPractices, false)
  })

  it("rejects missing name", () => {
    const result = createClinicSchema.safeParse({
      name: "",
      planId: PLAN_ID,
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
      planId: PLAN_ID,
      addressState: "sp",
      tradeName: "   ",
      email: "",
    })
    assert.equal(parsed.addressState, "SP")
    assert.equal(parsed.tradeName, undefined)
    assert.equal(parsed.email, undefined)
  })

  it("requires clinical fields when alsoPractices is true", () => {
    const result = createClinicSchema.safeParse({
      name: "Clínica",
      planId: PLAN_ID,
      alsoPractices: true,
    })
    assert.equal(result.success, false)
  })

  it("accepts alsoPractices with clinical profile", () => {
    const parsed = createClinicSchema.parse({
      name: "Clínica Solo",
      planId: PLAN_ID,
      alsoPractices: true,
      professionType: "physician",
      fullName: " Ana Silva ",
      treatmentPronoun: "dra",
      councilType: "CRM",
      councilNumber: "12345",
      councilState: "sp",
      specialty: "Clínica geral",
    })
    assert.equal(parsed.alsoPractices, true)
    assert.equal(parsed.fullName, "Ana Silva")
    assert.equal(parsed.councilState, "SP")

    const clinicFields = toClinicCreateFields(parsed)
    assert.equal("alsoPractices" in clinicFields, false)
    assert.equal("fullName" in clinicFields, false)
    assert.equal(clinicFields.name, "Clínica Solo")

    const profile = toOwnerClinicalProfileFields(parsed)
    assert.ok(profile)
    assert.equal(profile.professionType, "physician")
    assert.equal(profile.fullName, "Ana Silva")
  })

  it("accepts empty fullName when alsoPractices is false", () => {
    const parsed = createClinicSchema.parse({
      name: "Clínica",
      planId: PLAN_ID,
      alsoPractices: false,
      fullName: "",
      councilNumber: "",
      councilState: "",
      specialty: "",
    })
    assert.equal(parsed.alsoPractices, false)
    assert.equal(parsed.fullName, undefined)
    assert.equal(toOwnerClinicalProfileFields(parsed), null)
  })

  it("returns null clinical profile when alsoPractices is false", () => {
    const parsed = createClinicSchema.parse({
      name: "Clínica",
      planId: PLAN_ID,
      alsoPractices: false,
    })
    assert.equal(toOwnerClinicalProfileFields(parsed), null)
  })
})
