import assert from "node:assert/strict"
import { describe, it } from "node:test"

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
    assert.equal(
      CLINICAL_DOCUMENT_KIND_LABELS.attendance_declaration,
      "Declaração de comparecimento",
    )
  })

  it("uses clinic layouts only for prescriptions", () => {
    assert.equal(usesClinicPrescriptionLayouts("prescription"), true)
    assert.equal(usesClinicPrescriptionLayouts("attendance_declaration"), false)
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

    assert.match(plainText, /Maria <Souza>/)
    assert.match(plainText, /Clínica Exemplo/)
    assert.match(plainText, /Observações: Chegou pontual/)
    assert.match(body, /Maria &lt;Souza&gt;/)
    assert.equal(body.includes("<script"), false)
  })

  it("omits notes section when empty", () => {
    const { plainText } = buildAttendanceDeclarationBody({
      patientName: "Ana",
      appointmentStartsAt: new Date("2026-08-04T14:00:00.000Z"),
      clinicName: "Clínica",
      notes: "   ",
    })
    assert.equal(plainText.includes("Observações"), false)
  })
})

describe("attendance declaration layout", () => {
  it("compiles system default with declaration title", () => {
    assert.match(
      DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML,
      /Declaração de comparecimento/,
    )
    assert.match(DEFAULT_ATTENDANCE_DECLARATION_LAYOUT_HTML, /\{\{body\}\}/)
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
    assert.match(html, /Declaração de comparecimento/)
    assert.match(html, /Maria Souza/)
    assert.equal(html.includes("{{body}}"), false)
  })
})

describe("attendance declaration schemas", () => {
  it("accepts create with optional notes", () => {
    const parsed = createAttendanceDeclarationSchema.parse({
      appointmentId: VALID_UUID,
      notes: "Obs",
    })
    assert.equal(parsed.notes, "Obs")
  })

  it("accepts save-and-issue with optional id", () => {
    const parsed = saveAndIssueAttendanceDeclarationSchema.parse({
      appointmentId: VALID_UUID,
      id: VALID_UUID,
    })
    assert.equal(parsed.id, VALID_UUID)
  })
})
