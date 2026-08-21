import { describe, expect, it } from "@jest/globals"

import { toPatient } from "@/modules/patients/mappers/patient.mapper"
import {
  createPatientSchema,
  listPatientsSchema,
  updatePatientSchema,
} from "@/modules/patients/schemas/patient.schema"
import { getPatientAgeYears } from "@/modules/patients/utils/patient-age"
import {
  buildPatientDetailHref,
  buildPatientsListHref,
  patientsListLocationFromSearchParams,
  withPatientsListParams,
} from "@/modules/patients/utils/patients-list-href"

const VALID_CPF = "529.982.247-25"
const VALID_CPF_DIGITS = "52998224725"
const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("createPatientSchema", () => {
  it("accepts required name and cpf, stripping the CPF mask", () => {
    const parsed = createPatientSchema.parse({
      name: " Maria Silva ",
      cpf: VALID_CPF,
    })
    expect(parsed.name).toBe("Maria Silva")
    expect(parsed.cpf).toBe(VALID_CPF_DIGITS)
  })

  it("rejects missing name", () => {
    const result = createPatientSchema.safeParse({
      name: "",
      cpf: VALID_CPF,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid cpf", () => {
    const result = createPatientSchema.safeParse({
      name: "Maria Silva",
      cpf: "111.111.111-11",
    })
    expect(result.success).toBe(false)
  })

  it("drops empty optionals and validates optional fields when present", () => {
    const parsed = createPatientSchema.parse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      phone: "  ",
      email: "",
      birthDate: "",
    })
    expect(parsed.phone).toBe(undefined)
    expect(parsed.email).toBe(undefined)
    expect(parsed.birthDate).toBe(undefined)
  })

  it("accepts optional phone, email, birthDate and emergency contact", () => {
    const parsed = createPatientSchema.parse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      phone: "11999998888",
      email: "maria@example.com",
      birthDate: "1990-05-20",
      emergencyContactName: " João Silva ",
      emergencyContactPhone: "11988887777",
    })
    expect(parsed.phone).toBe("11999998888")
    expect(parsed.email).toBe("maria@example.com")
    expect(parsed.birthDate).toBe("1990-05-20")
    expect(parsed.emergencyContactName).toBe("João Silva")
    expect(parsed.emergencyContactPhone).toBe("11988887777")
  })

  it("drops empty emergency contact fields", () => {
    const parsed = createPatientSchema.parse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      emergencyContactName: "  ",
      emergencyContactPhone: "",
    })
    expect(parsed.emergencyContactName).toBe(undefined)
    expect(parsed.emergencyContactPhone).toBe(undefined)
  })

  it("accepts administrative notes and clears blank notes to null", () => {
    const withNotes = createPatientSchema.parse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      notes: " Prefere WhatsApp ",
    })
    expect(withNotes.notes).toBe("Prefere WhatsApp")

    const cleared = createPatientSchema.parse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      notes: "   ",
    })
    expect(cleared.notes).toBe(null)
  })

  it("rejects administrative notes over 1000 characters", () => {
    const result = createPatientSchema.safeParse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      notes: "a".repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email and birthDate format", () => {
    expect(createPatientSchema.safeParse({
        name: "Maria Silva",
        cpf: VALID_CPF,
        email: "not-an-email",
      }).success).toBe(false)

    expect(createPatientSchema.safeParse({
        name: "Maria Silva",
        cpf: VALID_CPF,
        birthDate: "20-05-1990",
      }).success).toBe(false)
  })
})

describe("updatePatientSchema", () => {
  it("requires a valid uuid id", () => {
    const result = updatePatientSchema.safeParse({
      id: "not-a-uuid",
      name: "Maria Silva",
    })
    expect(result.success).toBe(false)
  })

  it("accepts a partial update with a single field", () => {
    const parsed = updatePatientSchema.parse({
      id: VALID_UUID,
      phone: "11999998888",
    })
    expect(parsed.id).toBe(VALID_UUID)
    expect(parsed.phone).toBe("11999998888")
  })

  it("rejects update with no fields besides id", () => {
    const result = updatePatientSchema.safeParse({ id: VALID_UUID })
    expect(result.success).toBe(false)
  })

  it("accepts clearing administrative notes with an empty string", () => {
    const parsed = updatePatientSchema.parse({
      id: VALID_UUID,
      notes: "  ",
    })
    expect(parsed.notes).toBe(null)
  })

  it("validates cpf when provided", () => {
    const result = updatePatientSchema.safeParse({
      id: VALID_UUID,
      cpf: "111.111.111-11",
    })
    expect(result.success).toBe(false)
  })
})

describe("listPatientsSchema", () => {
  it("defaults page and pageSize with empty filter", () => {
    const parsed = listPatientsSchema.parse({})
    expect(parsed.q).toBe(undefined)
    expect(parsed.page).toBe(1)
    expect(parsed.pageSize).toBe(10)
  })

  it("trims q and converts empty string to undefined", () => {
    expect(listPatientsSchema.parse({ q: "  Maria  " }).q).toBe("Maria")
    expect(listPatientsSchema.parse({ q: "   " }).q).toBe(undefined)
  })

  it("accepts page and pageSize overrides", () => {
    const parsed = listPatientsSchema.parse({ q: "Ana", page: 2, pageSize: 10 })
    expect(parsed.q).toBe("Ana")
    expect(parsed.page).toBe(2)
    expect(parsed.pageSize).toBe(10)
  })
})

describe("patients list href helpers", () => {
  it("builds list and detail hrefs with q and page", () => {
    expect(buildPatientsListHref({ q: "Maria", page: 2 })).toBe("/patients?q=Maria&page=2")
    expect(buildPatientDetailHref(VALID_UUID, { q: "Maria", page: 2 })).toBe(`/patients/${VALID_UUID}?q=Maria&page=2`)
  })

  it("omits empty q and page 1", () => {
    expect(buildPatientsListHref({ q: "  ", page: 1 })).toBe("/patients")
    expect(buildPatientDetailHref(VALID_UUID)).toBe(`/patients/${VALID_UUID}`)
  })

  it("preserves list params on section hrefs and parses them back", () => {
    expect(withPatientsListParams(`/patients/${VALID_UUID}/profile`, {
        q: "Ana",
        page: 3,
      })).toBe(`/patients/${VALID_UUID}/profile?q=Ana&page=3`)

    const location = patientsListLocationFromSearchParams(
      new URLSearchParams("q=Ana&page=3"),
    )
    expect(location).toEqual({ q: "Ana", page: 3 })
  })
})

describe("toPatient mapper", () => {
  it("maps DB row fields to the domain Patient shape", () => {
    const now = new Date()
    const patient = toPatient({
      id: VALID_UUID,
      clinicId: "22222222-2222-4222-8222-222222222222",
      fullName: "Maria Silva",
      socialName: null,
      document: VALID_CPF_DIGITS,
      email: "maria@example.com",
      phone: "11999998888",
      birthDate: "1990-05-20",
      gender: null,
      emergencyContactName: "João Silva",
      emergencyContactPhone: "11988887777",
      notes: "Paciente preferencial",
      status: "active",
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: null,
      addressState: null,
      addressZip: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(patient.id).toBe(VALID_UUID)
    expect(patient.name).toBe("Maria Silva")
    expect(patient.cpf).toBe(VALID_CPF_DIGITS)
    expect(patient.email).toBe("maria@example.com")
    expect(patient.phone).toBe("11999998888")
    expect(patient.birthDate).toBe("1990-05-20")
    expect(patient.emergencyContactName).toBe("João Silva")
    expect(patient.emergencyContactPhone).toBe("11988887777")
    expect(patient.notes).toBe("Paciente preferencial")
    expect(patient.status).toBe("active")
    expect(patient.createdAt).toBe(now)
  })

  it("falls back to status active when the DB value is unexpected", () => {
    const now = new Date()
    const patient = toPatient({
      id: VALID_UUID,
      clinicId: "22222222-2222-4222-8222-222222222222",
      fullName: "João Souza",
      socialName: null,
      document: null,
      email: null,
      phone: null,
      birthDate: null,
      gender: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      notes: null,
      status: "unknown-status",
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: null,
      addressState: null,
      addressZip: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    expect(patient.status).toBe("active")
    expect(patient.cpf).toBe("")
  })
})

describe("getPatientAgeYears", () => {
  it("returns full years from birthDate", () => {
    const now = new Date("2026-07-24T12:00:00.000Z")
    expect(getPatientAgeYears("1990-05-20", now)).toBe(36)
  })

  it("returns null when birthDate is missing or invalid", () => {
    expect(getPatientAgeYears(null)).toBe(null)
    expect(getPatientAgeYears(undefined)).toBe(null)
    expect(getPatientAgeYears("not-a-date")).toBe(null)
  })
})
