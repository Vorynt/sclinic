import { describe, expect, it } from "@jest/globals"

import {
  CLINICAL_NOTE_TEMPLATES,
  getClinicalNoteTemplateOrThrow,
  getTemplateDefaultValues,
} from "@/modules/medical-records/constants/clinical-note-templates"
import { canEditClinicalNote } from "@/modules/medical-records/constants/clinical-notes"
import { toClinicalNote } from "@/modules/medical-records/mappers/clinical-note.mapper"
import {
  buildTemplateValuesSchema,
  isFormUpsert,
  listPatientClinicalNotesSchema,
  upsertClinicalNoteSchema,
} from "@/modules/medical-records/schemas/clinical-note.schema"
import {
  compileClinicalNoteForm,
  isCompiledNoteEmpty,
} from "@/modules/medical-records/utils/compile-clinical-note-form"
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
    expect(canEditClinicalNote("checked_in")).toBe(true)
    expect(canEditClinicalNote("completed")).toBe(false)
  })
})

describe("clinical note form templates", () => {
  it("exposes declarative templates without TipTap docs", () => {
    expect(CLINICAL_NOTE_TEMPLATES.map((template) => template.id)).toEqual(["blank", "first_visit", "follow_up", "soap", "procedure"])
    for (const template of CLINICAL_NOTE_TEMPLATES) {
      expect(Array.isArray(template.fields)).toBeTruthy()
      expect(template.fields.length > 0).toBeTruthy()
      expect("content" in template).toBe(false)
    }
  })

  it("builds default values for fillable fields only", () => {
    const soap = getClinicalNoteTemplateOrThrow("soap")
    const defaults = getTemplateDefaultValues(soap)
    expect(defaults.s_chief).toBe("")
    expect("sec_s" in defaults).toBe(false)
  })
})

describe("compileClinicalNoteForm", () => {
  it("compiles switches, text and checklist into TipTap nodes", () => {
    const template = getClinicalNoteTemplateOrThrow("procedure")
    const { content, plainText } = compileClinicalNoteForm(template, {
      ...getTemplateDefaultValues(template),
      procedure_name: "Excisão de nevo",
      indication: "Lesão pigmentada",
      consent_obtained: true,
      had_complication: false,
      technique: "Excisão elíptica com margem",
    })

    expect(content.type).toBe("doc")
    expect(plainText).toMatch(/Procedimento realizado: Excisão de nevo/)
    expect(plainText).toMatch(/Consentimento informado obtido: Sim/)
    expect(plainText).toMatch(/Houve intercorrência\?: Não/)
    expect(isCompiledNoteEmpty(plainText)).toBe(false)
  })

  it("omits empty text fields and empty sections", () => {
    const template = getClinicalNoteTemplateOrThrow("blank")
    const empty = compileClinicalNoteForm(template, { body: "" })
    expect(isCompiledNoteEmpty(empty.plainText)).toBe(true)

    const filled = compileClinicalNoteForm(template, {
      body: "Evolução favorável.",
    })
    expect(filled.plainText).toMatch(/Anotação: Evolução favorável/)
  })

  it("renders select labels and checklist bullets", () => {
    const template = getClinicalNoteTemplateOrThrow("follow_up")
    const { plainText, content } = compileClinicalNoteForm(template, {
      ...getTemplateDefaultValues(template),
      return_reason: "Reavaliação",
      clinical_course: "improved",
      adherence: "full",
    })
    expect(plainText).toMatch(/Curso clínico: Melhora/)
    expect(plainText).toMatch(/Adesão à medicação: Conforme prescrito/)
    const lists =
      content.content?.filter((node) => node.type === "bulletList") ?? []
    expect(lists.length).toBe(0)
  })
})

describe("upsertClinicalNoteSchema", () => {
  it("accepts form upsert and validates required fields", () => {
    const parsed = upsertClinicalNoteSchema.parse({
      appointmentId: VALID_UUID,
      templateId: "blank",
      formValues: { body: "Nota clínica" },
    })
    expect(isFormUpsert(parsed)).toBe(true)

    const invalid = upsertClinicalNoteSchema.safeParse({
      appointmentId: VALID_UUID,
      templateId: "blank",
      formValues: { body: "" },
    })
    expect(invalid.success).toBe(false)
  })

  it("accepts legacy TipTap upsert", () => {
    const parsed = upsertClinicalNoteSchema.parse({
      appointmentId: VALID_UUID,
      content: VALID_DOC,
      plainText: "Paciente evolui bem.",
    })
    expect(isFormUpsert(parsed)).toBe(false)
  })

  it("builds per-template zod values schema", () => {
    const soap = getClinicalNoteTemplateOrThrow("soap")
    const schema = buildTemplateValuesSchema(soap)
    const ok = schema.safeParse({
      ...getTemplateDefaultValues(soap),
      s_chief: "Dispneia",
      a_primary: "Asma",
    })
    expect(ok.success).toBe(true)

    const bad = schema.safeParse({
      ...getTemplateDefaultValues(soap),
      s_chief: "",
      a_primary: "Asma",
    })
    expect(bad.success).toBe(false)
  })
})

describe("listPatientClinicalNotesSchema", () => {
  it("requires a valid patient id", () => {
    expect(listPatientClinicalNotesSchema.safeParse({
        patientId: VALID_UUID,
      }).success).toBe(true)
  })
})

describe("toClinicalNote mapper", () => {
  it("maps form fields and TipTap content", () => {
    const note = toClinicalNote({
      id: VALID_UUID,
      clinicId: OTHER_UUID,
      patientId: OTHER_UUID,
      appointmentId: VALID_UUID,
      professionalId: OTHER_UUID,
      professionalName: "Dra. Ana",
      content: VALID_DOC,
      plainText: "Paciente evolui bem.",
      templateId: "soap",
      formValues: { s_chief: "Dor" },
      appointmentStartsAt: new Date("2026-07-24T14:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(note.templateId).toBe("soap")
    expect(note.formValues?.s_chief).toBe("Dor")
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

    expect(() => assertEditable("checked_in")).not.toThrow()
    try {
      assertEditable("completed")
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(
        ((error: unknown) =>
                error instanceof AppError && error.code === ErrorCode.CONFLICT)(error),
      ).toBe(true)
    }
  })
})
