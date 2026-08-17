import { describe, expect, it } from "@jest/globals"

import {
  CLINICAL_DOCUMENT_KIND_LABELS,
  IMPLEMENTED_CLINICAL_DOCUMENT_KINDS,
  usesClinicPrescriptionLayouts,
} from "@/modules/medical-records/constants/clinical-documents"
import { DEFAULT_EXAM_REQUEST_LAYOUT_HTML } from "@/modules/medical-records/constants/exam-request-layout-default"
import { DEFAULT_MEDICAL_CERTIFICATE_LAYOUT_HTML } from "@/modules/medical-records/constants/medical-certificate-layout-default"
import {
  createExamRequestSchema,
  createMedicalCertificateSchema,
  saveAndIssueExamRequestSchema,
  saveAndIssueMedicalCertificateSchema,
} from "@/modules/medical-records/schemas/prescription.schema"
import { buildExamRequestBody } from "@/modules/medical-records/utils/exam-request-body"
import { buildMedicalCertificateBody } from "@/modules/medical-records/utils/medical-certificate-body"
import { renderPrescriptionHtml } from "@/modules/medical-records/utils/render-prescription"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("clinical document kinds — H1 complete", () => {
  it("implements all four document kinds", () => {
    expect(IMPLEMENTED_CLINICAL_DOCUMENT_KINDS).toEqual([
      "prescription",
      "attendance_declaration",
      "medical_certificate",
      "exam_request",
    ])
  })

  it("labels medical certificate and exam request in Portuguese", () => {
    expect(CLINICAL_DOCUMENT_KIND_LABELS.medical_certificate).toBe("Atestado")
    expect(CLINICAL_DOCUMENT_KIND_LABELS.exam_request).toBe(
      "Solicitação de exames",
    )
  })

  it("uses clinic layouts only for prescriptions", () => {
    expect(usesClinicPrescriptionLayouts("medical_certificate")).toBe(false)
    expect(usesClinicPrescriptionLayouts("exam_request")).toBe(false)
  })
})

describe("buildMedicalCertificateBody", () => {
  it("generates plain text and escaped HTML with days off", () => {
    const { body, plainText } = buildMedicalCertificateBody({
      patientName: "Maria <Souza>",
      patientDocument: "123.456.789-00",
      daysOff: 3,
      cid: "J06.9",
      notes: "Repouso relativo",
      locale: "pt-BR",
    })

    expect(plainText).toMatch(/3 dias de afastamento/)
    expect(plainText).toMatch(/CID: J06.9/)
    expect(plainText).toMatch(/Observações: Repouso relativo/)
    expect(body).toMatch(/Maria &lt;Souza&gt;/)
    expect(body.includes("<script")).toBe(false)
  })

  it("uses singular day label for 1 day", () => {
    const { plainText } = buildMedicalCertificateBody({
      patientName: "Ana",
      daysOff: 1,
      locale: "pt-BR",
    })
    expect(plainText).toMatch(/1 dia de afastamento/)
  })
})

describe("buildExamRequestBody", () => {
  it("generates exam list in plain text and HTML", () => {
    const { body, plainText } = buildExamRequestBody({
      patientName: "João",
      patientDocument: "123.456.789-00",
      exams: ["Hemograma", "Glicemia"],
      notes: "Investigação de anemia",
    })

    expect(plainText).toMatch(/1\. Hemograma/)
    expect(plainText).toMatch(/2\. Glicemia/)
    expect(plainText).toMatch(/Indicação clínica: Investigação de anemia/)
    expect(body).toMatch(/<ul><li>Hemograma<\/li><li>Glicemia<\/li><\/ul>/)
  })
})

describe("medical certificate layout", () => {
  it("compiles system default with certificate title", () => {
    expect(DEFAULT_MEDICAL_CERTIFICATE_LAYOUT_HTML).toMatch(/Atestado médico/)
    expect(DEFAULT_MEDICAL_CERTIFICATE_LAYOUT_HTML).toMatch(/\{\{body\}\}/)
  })

  it("renders certificate body into system layout", () => {
    const { body } = buildMedicalCertificateBody({
      patientName: "Maria Souza",
      daysOff: 2,
    })
    const html = renderPrescriptionHtml({
      layoutHtml: DEFAULT_MEDICAL_CERTIFICATE_LAYOUT_HTML,
      body,
      clinic: { id: VALID_UUID, name: "Clínica Exemplo" },
      patient: { id: VALID_UUID, name: "Maria Souza" },
      professional: { id: VALID_UUID, name: "Dr. João" },
      issuedAt: new Date("2026-08-04T15:00:00.000Z"),
    })
    expect(html).toMatch(/Atestado médico/)
    expect(html).toMatch(/2 dias/)
    expect(html.includes("{{body}}")).toBe(false)
  })
})

describe("exam request layout", () => {
  it("compiles system default with exam request title", () => {
    expect(DEFAULT_EXAM_REQUEST_LAYOUT_HTML).toMatch(/Solicitação de exames/)
    expect(DEFAULT_EXAM_REQUEST_LAYOUT_HTML).toMatch(/\{\{body\}\}/)
  })
})

describe("medical certificate schemas", () => {
  it("accepts create with days off and optional fields", () => {
    const parsed = createMedicalCertificateSchema.parse({
      appointmentId: VALID_UUID,
      daysOff: 5,
      cid: "J06.9",
    })
    expect(parsed.daysOff).toBe(5)
    expect(parsed.cid).toBe("J06.9")
  })

  it("accepts save-and-issue with optional id", () => {
    const parsed = saveAndIssueMedicalCertificateSchema.parse({
      appointmentId: VALID_UUID,
      id: VALID_UUID,
      daysOff: 1,
    })
    expect(parsed.id).toBe(VALID_UUID)
  })
})

describe("exam request schemas", () => {
  it("parses exams from multiline text", () => {
    const parsed = createExamRequestSchema.parse({
      appointmentId: VALID_UUID,
      examsText: "Hemograma\n\nGlicemia\n",
    })
    expect(parsed.exams).toEqual(["Hemograma", "Glicemia"])
  })

  it("rejects empty exam list", () => {
    expect(() =>
      createExamRequestSchema.parse({
        appointmentId: VALID_UUID,
        examsText: "   \n  ",
      }),
    ).toThrow()
  })

  it("accepts save-and-issue with optional id", () => {
    const parsed = saveAndIssueExamRequestSchema.parse({
      appointmentId: VALID_UUID,
      id: VALID_UUID,
      examsText: "TSH",
    })
    expect(parsed.exams).toEqual(["TSH"])
  })
})
