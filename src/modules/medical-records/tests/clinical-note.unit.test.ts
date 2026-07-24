import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { canEditClinicalNote } from "@/modules/medical-records/constants/clinical-notes"
import { toClinicalNote } from "@/modules/medical-records/mappers/clinical-note.mapper"
import {
  listPatientClinicalNotesSchema,
  upsertClinicalNoteSchema,
} from "@/modules/medical-records/schemas/clinical-note.schema"
import { AppError, ErrorCode } from "@/shared/errors"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"
const OTHER_UUID = "22222222-2222-4222-8222-222222222222"

const VALID_DOC = {
  type: "doc" as const,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Paciente evolui bem." }],
    },
  ],
}

describe("canEditClinicalNote", () => {
  it("allows editing only while attendance is checked_in", () => {
    assert.equal(canEditClinicalNote("checked_in"), true)
    assert.equal(canEditClinicalNote("scheduled"), false)
    assert.equal(canEditClinicalNote("confirmed"), false)
    assert.equal(canEditClinicalNote("completed"), false)
    assert.equal(canEditClinicalNote("canceled"), false)
    assert.equal(canEditClinicalNote("no_show"), false)
  })
})

describe("upsertClinicalNoteSchema", () => {
  it("accepts a TipTap doc with plain text", () => {
    const parsed = upsertClinicalNoteSchema.parse({
      appointmentId: VALID_UUID,
      content: VALID_DOC,
      plainText: "Paciente evolui bem.",
    })
    assert.equal(parsed.appointmentId, VALID_UUID)
    assert.equal(parsed.plainText, "Paciente evolui bem.")
    assert.equal(parsed.content.type, "doc")
  })

  it("rejects empty plain text", () => {
    const result = upsertClinicalNoteSchema.safeParse({
      appointmentId: VALID_UUID,
      content: VALID_DOC,
      plainText: "   ",
    })
    assert.equal(result.success, false)
  })

  it("rejects content that is not a TipTap doc", () => {
    const result = upsertClinicalNoteSchema.safeParse({
      appointmentId: VALID_UUID,
      content: { type: "paragraph" },
      plainText: "texto",
    })
    assert.equal(result.success, false)
  })

  it("rejects invalid appointment id", () => {
    const result = upsertClinicalNoteSchema.safeParse({
      appointmentId: "not-a-uuid",
      content: VALID_DOC,
      plainText: "texto",
    })
    assert.equal(result.success, false)
  })
})

describe("listPatientClinicalNotesSchema", () => {
  it("requires a valid appointment id", () => {
    assert.equal(
      listPatientClinicalNotesSchema.safeParse({
        appointmentId: VALID_UUID,
      }).success,
      true,
    )
    assert.equal(
      listPatientClinicalNotesSchema.safeParse({
        appointmentId: "bad",
      }).success,
      false,
    )
  })
})

describe("toClinicalNote mapper", () => {
  it("maps repository row fields to the domain type", () => {
    const startsAt = new Date("2026-07-24T14:00:00.000Z")
    const createdAt = new Date("2026-07-24T14:05:00.000Z")
    const updatedAt = new Date("2026-07-24T14:10:00.000Z")

    const note = toClinicalNote({
      id: VALID_UUID,
      clinicId: OTHER_UUID,
      patientId: OTHER_UUID,
      appointmentId: VALID_UUID,
      professionalId: OTHER_UUID,
      professionalName: "Dra. Ana",
      content: VALID_DOC,
      plainText: "Paciente evolui bem.",
      appointmentStartsAt: startsAt,
      createdAt,
      updatedAt,
    })

    assert.equal(note.id, VALID_UUID)
    assert.equal(note.professionalName, "Dra. Ana")
    assert.equal(note.plainText, "Paciente evolui bem.")
    assert.equal(note.appointmentStartsAt, startsAt)
    assert.equal(note.content.type, "doc")
  })
})

describe("clinical note edit guard (service rule)", () => {
  it("blocks upsert when status is not checked_in", () => {
    function assertEditable(status: Parameters<typeof canEditClinicalNote>[0]) {
      if (!canEditClinicalNote(status)) {
        throw new AppError(ErrorCode.CONFLICT, {
          message:
            "Só é possível editar anotações enquanto o atendimento está em andamento.",
        })
      }
    }

    assert.doesNotThrow(() => assertEditable("checked_in"))
    assert.throws(
      () => assertEditable("completed"),
      (error: unknown) =>
        error instanceof AppError && error.code === ErrorCode.CONFLICT,
    )
  })
})
