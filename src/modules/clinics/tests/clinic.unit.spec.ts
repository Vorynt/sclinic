import { describe, expect, it } from "@jest/globals"

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
    expect(parsed.name).toBe("Clínica Alpha")
    expect(parsed.planId).toBe(PLAN_ID)
    expect(parsed.alsoPractices).toBe(false)
  })

  it("rejects missing name", () => {
    const result = createClinicSchema.safeParse({
      name: "",
      planId: PLAN_ID,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid planId", () => {
    const result = createClinicSchema.safeParse({
      name: "Clínica",
      planId: "not-a-uuid",
    })
    expect(result.success).toBe(false)
  })

  it("uppercases UF and drops empty optionals", () => {
    const parsed = createClinicSchema.parse({
      name: "Clínica",
      planId: PLAN_ID,
      addressState: "sp",
      tradeName: "   ",
      email: "",
    })
    expect(parsed.addressState).toBe("SP")
    expect(parsed.tradeName).toBe(undefined)
    expect(parsed.email).toBe(undefined)
  })

  it("requires clinical fields when alsoPractices is true", () => {
    const result = createClinicSchema.safeParse({
      name: "Clínica",
      planId: PLAN_ID,
      alsoPractices: true,
    })
    expect(result.success).toBe(false)
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
    expect(parsed.alsoPractices).toBe(true)
    expect(parsed.fullName).toBe("Ana Silva")
    expect(parsed.councilState).toBe("SP")

    const clinicFields = toClinicCreateFields(parsed)
    expect("alsoPractices" in clinicFields).toBe(false)
    expect("fullName" in clinicFields).toBe(false)
    expect(clinicFields.name).toBe("Clínica Solo")

    const profile = toOwnerClinicalProfileFields(parsed)
    expect(profile).toBeTruthy()
    expect(profile.professionType).toBe("physician")
    expect(profile.fullName).toBe("Ana Silva")
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
    expect(parsed.alsoPractices).toBe(false)
    expect(parsed.fullName).toBe(undefined)
    expect(toOwnerClinicalProfileFields(parsed)).toBe(null)
  })

  it("returns null clinical profile when alsoPractices is false", () => {
    const parsed = createClinicSchema.parse({
      name: "Clínica",
      planId: PLAN_ID,
      alsoPractices: false,
    })
    expect(toOwnerClinicalProfileFields(parsed)).toBe(null)
  })
})
