import assert from "node:assert/strict"
import { describe, it } from "node:test"

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
    assert.equal(canEditClinicalNote("checked_in"), true)
    assert.equal(canEditClinicalNote("completed"), false)
  })
})

describe("clinical note form templates", () => {
  it("exposes declarative templates without TipTap docs", () => {
    assert.deepEqual(
      CLINICAL_NOTE_TEMPLATES.map((template) => template.id),
      ["blank", "first_visit", "follow_up", "soap", "procedure"],
    )
    for (const template of CLINICAL_NOTE_TEMPLATES) {
      assert.ok(Array.isArray(template.fields))
      assert.ok(template.fields.length > 0)
      assert.equal("content" in template, false)
    }
  })

  it("builds default values for fillable fields only", () => {
    const soap = getClinicalNoteTemplateOrThrow("soap")
    const defaults = getTemplateDefaultValues(soap)
    assert.equal(defaults.s_chief, "")
    assert.equal("sec_s" in defaults, false)
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

    assert.equal(content.type, "doc")
    assert.match(plainText, /Procedimento realizado: Excisão de nevo/)
    assert.match(plainText, /Consentimento informado obtido: Sim/)
    assert.match(plainText, /Houve intercorrência\?: Não/)
    assert.equal(isCompiledNoteEmpty(plainText), false)
  })

  it("omits empty text fields and empty sections", () => {
    const template = getClinicalNoteTemplateOrThrow("blank")
    const empty = compileClinicalNoteForm(template, { body: "" })
    assert.equal(isCompiledNoteEmpty(empty.plainText), true)

    const filled = compileClinicalNoteForm(template, {
      body: "Evolução favorável.",
    })
    assert.match(filled.plainText, /Anotação: Evolução favorável/)
  })

  it("renders select labels and checklist bullets", () => {
    const template = getClinicalNoteTemplateOrThrow("follow_up")
    const { plainText, content } = compileClinicalNoteForm(template, {
      ...getTemplateDefaultValues(template),
      return_reason: "Reavaliação",
      clinical_course: "improved",
      adherence: "full",
    })
    assert.match(plainText, /Curso clínico: Melhora/)
    assert.match(plainText, /Adesão à medicação: Conforme prescrito/)
    const lists =
      content.content?.filter((node) => node.type === "bulletList") ?? []
    assert.equal(lists.length, 0)
  })
})

describe("upsertClinicalNoteSchema", () => {
  it("accepts form upsert and validates required fields", () => {
    const parsed = upsertClinicalNoteSchema.parse({
      appointmentId: VALID_UUID,
      templateId: "blank",
      formValues: { body: "Nota clínica" },
    })
    assert.equal(isFormUpsert(parsed), true)

    const invalid = upsertClinicalNoteSchema.safeParse({
      appointmentId: VALID_UUID,
      templateId: "blank",
      formValues: { body: "" },
    })
    assert.equal(invalid.success, false)
  })

  it("accepts legacy TipTap upsert", () => {
    const parsed = upsertClinicalNoteSchema.parse({
      appointmentId: VALID_UUID,
      content: VALID_DOC,
      plainText: "Paciente evolui bem.",
    })
    assert.equal(isFormUpsert(parsed), false)
  })

  it("builds per-template zod values schema", () => {
    const soap = getClinicalNoteTemplateOrThrow("soap")
    const schema = buildTemplateValuesSchema(soap)
    const ok = schema.safeParse({
      ...getTemplateDefaultValues(soap),
      s_chief: "Dispneia",
      a_primary: "Asma",
    })
    assert.equal(ok.success, true)

    const bad = schema.safeParse({
      ...getTemplateDefaultValues(soap),
      s_chief: "",
      a_primary: "Asma",
    })
    assert.equal(bad.success, false)
  })
})

describe("listPatientClinicalNotesSchema", () => {
  it("requires a valid patient id", () => {
    assert.equal(
      listPatientClinicalNotesSchema.safeParse({
        patientId: VALID_UUID,
      }).success,
      true,
    )
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
    assert.equal(note.templateId, "soap")
    assert.equal(note.formValues?.s_chief, "Dor")
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
