import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { toPatient } from "@/modules/patients/mappers/patient.mapper"
import {
  createPatientSchema,
  listPatientsSchema,
  updatePatientSchema,
} from "@/modules/patients/schemas/patient.schema"

const VALID_CPF = "529.982.247-25"
const VALID_CPF_DIGITS = "52998224725"
const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("createPatientSchema", () => {
  it("accepts required name and cpf, stripping the CPF mask", () => {
    const parsed = createPatientSchema.parse({
      name: " Maria Silva ",
      cpf: VALID_CPF,
    })
    assert.equal(parsed.name, "Maria Silva")
    assert.equal(parsed.cpf, VALID_CPF_DIGITS)
  })

  it("rejects missing name", () => {
    const result = createPatientSchema.safeParse({
      name: "",
      cpf: VALID_CPF,
    })
    assert.equal(result.success, false)
  })

  it("rejects invalid cpf", () => {
    const result = createPatientSchema.safeParse({
      name: "Maria Silva",
      cpf: "111.111.111-11",
    })
    assert.equal(result.success, false)
  })

  it("drops empty optionals and validates optional fields when present", () => {
    const parsed = createPatientSchema.parse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      phone: "  ",
      email: "",
      birthDate: "",
    })
    assert.equal(parsed.phone, undefined)
    assert.equal(parsed.email, undefined)
    assert.equal(parsed.birthDate, undefined)
  })

  it("accepts optional phone, email and birthDate", () => {
    const parsed = createPatientSchema.parse({
      name: "Maria Silva",
      cpf: VALID_CPF,
      phone: "11999998888",
      email: "maria@example.com",
      birthDate: "1990-05-20",
    })
    assert.equal(parsed.phone, "11999998888")
    assert.equal(parsed.email, "maria@example.com")
    assert.equal(parsed.birthDate, "1990-05-20")
  })

  it("rejects invalid email and birthDate format", () => {
    assert.equal(
      createPatientSchema.safeParse({
        name: "Maria Silva",
        cpf: VALID_CPF,
        email: "not-an-email",
      }).success,
      false,
    )

    assert.equal(
      createPatientSchema.safeParse({
        name: "Maria Silva",
        cpf: VALID_CPF,
        birthDate: "20-05-1990",
      }).success,
      false,
    )
  })
})

describe("updatePatientSchema", () => {
  it("requires a valid uuid id", () => {
    const result = updatePatientSchema.safeParse({
      id: "not-a-uuid",
      name: "Maria Silva",
    })
    assert.equal(result.success, false)
  })

  it("accepts a partial update with a single field", () => {
    const parsed = updatePatientSchema.parse({
      id: VALID_UUID,
      phone: "11999998888",
    })
    assert.equal(parsed.id, VALID_UUID)
    assert.equal(parsed.phone, "11999998888")
  })

  it("rejects update with no fields besides id", () => {
    const result = updatePatientSchema.safeParse({ id: VALID_UUID })
    assert.equal(result.success, false)
  })

  it("validates cpf when provided", () => {
    const result = updatePatientSchema.safeParse({
      id: VALID_UUID,
      cpf: "111.111.111-11",
    })
    assert.equal(result.success, false)
  })
})

describe("listPatientsSchema", () => {
  it("defaults to an empty filter", () => {
    const parsed = listPatientsSchema.parse({})
    assert.equal(parsed.q, undefined)
  })

  it("trims q and converts empty string to undefined", () => {
    assert.equal(listPatientsSchema.parse({ q: "  Maria  " }).q, "Maria")
    assert.equal(listPatientsSchema.parse({ q: "   " }).q, undefined)
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
      emergencyContactName: null,
      emergencyContactPhone: null,
      notes: null,
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

    assert.equal(patient.id, VALID_UUID)
    assert.equal(patient.name, "Maria Silva")
    assert.equal(patient.cpf, VALID_CPF_DIGITS)
    assert.equal(patient.email, "maria@example.com")
    assert.equal(patient.phone, "11999998888")
    assert.equal(patient.birthDate, "1990-05-20")
    assert.equal(patient.status, "active")
    assert.equal(patient.createdAt, now)
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

    assert.equal(patient.status, "active")
    assert.equal(patient.cpf, "")
  })
})
