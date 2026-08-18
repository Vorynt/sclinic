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
  upsertClinicalNoteContentSchema,
  upsertClinicalNoteSchema,
} from "@/modules/medical-records/schemas/clinical-note.schema"
import {
  compileClinicalNoteForm,
  isCompiledNoteEmpty,
} from "@/modules/medical-records/utils/compile-clinical-note-form"
import {
  canPersistClinicalNote,
  fingerprintClinicalNote,
  formatClinicalNoteSavedAt,
  getClinicalNoteSaveStatusLabel,
} from "@/modules/medical-records/utils/clinical-note-autosave"
import {
  CLINICAL_NOTE_SNIPPETS,
  getClinicalNoteSnippet,
} from "@/modules/medical-records/utils/clinical-note-snippets"
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
  it("accepts TipTap content upsert as primary path", () => {
    const parsed = upsertClinicalNoteContentSchema.parse({
      appointmentId: VALID_UUID,
      content: VALID_DOC,
      plainText: "Paciente evolui bem.",
    })
    expect(isFormUpsert(parsed)).toBe(false)
  })

  it("rejects empty TipTap content", () => {
    const invalid = upsertClinicalNoteContentSchema.safeParse({
      appointmentId: VALID_UUID,
      content: VALID_DOC,
      plainText: "",
    })
    expect(invalid.success).toBe(false)
  })

  it("accepts legacy form upsert for API compatibility", () => {
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

describe("clinical note snippets", () => {
  it("exposes TipTap snippets for each clinical model except blank", () => {
    expect(CLINICAL_NOTE_SNIPPETS.map((snippet) => snippet.id)).toEqual([
      "first_visit",
      "follow_up",
      "soap",
      "procedure",
    ])
    for (const snippet of CLINICAL_NOTE_SNIPPETS) {
      expect(snippet.content.length).toBeGreaterThan(0)
      expect(
        snippet.content.every(
          (node) => node.type === "heading" || node.type === "paragraph",
        ),
      ).toBe(true)
      for (const node of snippet.content) {
        if (node.type === "paragraph") {
          expect(node.content).toBeUndefined()
        }
      }
    }
  })

  it("resolves snippets by template id", () => {
    expect(getClinicalNoteSnippet("soap")?.label).toBe("SOAP clínico")
    expect(getClinicalNoteSnippet("blank")).toBeNull()
  })
})

describe("clinical note autosave helpers", () => {
  it("fingerprints content and trimmed plain text", () => {
    const left = fingerprintClinicalNote(VALID_DOC, "  texto  ")
    const right = fingerprintClinicalNote(VALID_DOC, "texto")
    expect(left).toBe(right)
  })

  it("does not persist empty or unchanged notes", () => {
    const saved = fingerprintClinicalNote(VALID_DOC, "Paciente evolui bem.")
    expect(canPersistClinicalNote("", saved, saved)).toBe(false)
    expect(
      canPersistClinicalNote("Paciente evolui bem.", saved, saved),
    ).toBe(false)
    expect(
      canPersistClinicalNote(
        "Paciente piorou.",
        fingerprintClinicalNote(VALID_DOC, "Paciente piorou."),
        saved,
      ),
    ).toBe(true)
  })

  it("formats last saved time and status labels", () => {
    const savedAt = new Date(2026, 7, 18, 14, 32)
    expect(formatClinicalNoteSavedAt(savedAt)).toBe("14:32")
    expect(getClinicalNoteSaveStatusLabel("dirty", savedAt)).toBe(
      "Salvo às 14:32",
    )
    expect(getClinicalNoteSaveStatusLabel("dirty", null)).toBeNull()
    expect(getClinicalNoteSaveStatusLabel("saving", savedAt)).toBe("Salvando…")
    expect(getClinicalNoteSaveStatusLabel("error", savedAt)).toBe(
      "Não foi possível salvar",
    )
    expect(getClinicalNoteSaveStatusLabel("saved", savedAt)).toBe(
      "Salvo às 14:32",
    )
    expect(getClinicalNoteSaveStatusLabel("idle", null)).toBeNull()
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
