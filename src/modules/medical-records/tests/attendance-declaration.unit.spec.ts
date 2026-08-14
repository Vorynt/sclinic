import { describe, expect, it } from "@jest/globals"

import {
  CLINICAL_DOCUMENT_KIND_LABELS,
  usesClinicPrescriptionLayouts,
} from "@/modules/medical-records/constants/clinical-documents"
import { DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML } from "@/modules/medical-records/constants/attendance-declaration-layout-default"
import {
  createAttendanceDeclarationSchema,
  saveAndIssueAttendanceDeclarationSchema,
} from "@/modules/medical-records/schemas/prescription.schema"
import { buildAttendanceDeclarationBody } from "@/modules/medical-records/utils/attendance-declaration-body"
import { renderPrescriptionHtml } from "@/modules/medical-records/utils/render-prescription"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("clinical document kinds", () => {
  it("labels attendance declaration in Portuguese", () => {
    expect(CLINICAL_DOCUMENT_KIND_LABELS.attendance_declaration).toBe("Declaração de comparecimento")
  })

  it("uses clinic layouts only for prescriptions", () => {
    expect(usesClinicPrescriptionLayouts("prescription")).toBe(true)
    expect(usesClinicPrescriptionLayouts("attendance_declaration")).toBe(false)
  })
})

describe("buildAttendanceDeclarationBody", () => {
  it("generates plain text and escaped HTML with patient and clinic", () => {
    const { body, plainText } = buildAttendanceDeclarationBody({
      patientName: "Maria <Souza>",
      patientDocument: "123.456.789-00",
      appointmentStartsAt: new Date("2026-08-04T14:00:00.000Z"),
      professionalName: "Dr. João",
      clinicName: "Clínica Exemplo",
      notes: "Chegou pontual",
      locale: "pt-BR",
    })

    expect(plainText).toMatch(/Maria <Souza>/)
    expect(plainText).toMatch(/Clínica Exemplo/)
    expect(plainText).toMatch(/Observações: Chegou pontual/)
    expect(body).toMatch(/Maria &lt;Souza&gt;/)
    expect(body.includes("<script")).toBe(false)
  })

  it("omits notes section when empty", () => {
    const { plainText } = buildAttendanceDeclarationBody({
      patientName: "Ana",
      appointmentStartsAt: new Date("2026-08-04T14:00:00.000Z"),
      clinicName: "Clínica",
      notes: "   ",
    })
    expect(plainText.includes("Observações")).toBe(false)
  })
})

describe("attendance declaration layout", () => {
  it("compiles system default with declaration title", () => {
    expect(DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML).toMatch(/Declaração de comparecimento/)
    expect(DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML).toMatch(/\{\{body\}\}/)
  })

  it("renders declaration body into system layout", () => {
    const { body } = buildAttendanceDeclarationBody({
      patientName: "Maria Souza",
      appointmentStartsAt: new Date("2026-08-04T14:00:00.000Z"),
      clinicName: "Clínica Exemplo",
    })
    const html = renderPrescriptionHtml({
      layoutHtml: DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML,
      body,
      clinic: { id: VALID_UUID, name: "Clínica Exemplo" },
      patient: { id: VALID_UUID, name: "Maria Souza" },
      professional: { id: VALID_UUID, name: "Dr. João" },
      issuedAt: new Date("2026-08-04T15:00:00.000Z"),
    })
    expect(html).toMatch(/Declaração de comparecimento/)
    expect(html).toMatch(/Maria Souza/)
    expect(html.includes("{{body}}")).toBe(false)
  })
})

describe("attendance declaration schemas", () => {
  it("accepts create with optional notes", () => {
    const parsed = createAttendanceDeclarationSchema.parse({
      appointmentId: VALID_UUID,
      notes: "Obs",
    })
    expect(parsed.notes).toBe("Obs")
  })

  it("accepts save-and-issue with optional id", () => {
    const parsed = saveAndIssueAttendanceDeclarationSchema.parse({
      appointmentId: VALID_UUID,
      id: VALID_UUID,
    })
    expect(parsed.id).toBe(VALID_UUID)
  })
})
