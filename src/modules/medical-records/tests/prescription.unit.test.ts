import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { canEditPrescription } from "@/modules/medical-records/constants/prescriptions"
import { DEFAULT_PRESCRIPTION_LAYOUT_HTML } from "@/modules/medical-records/constants/prescription-layout-default"
import { toPrescription } from "@/modules/medical-records/mappers/prescription.mapper"
import {
  createPrescriptionSchema,
  issuePrescriptionSchema,
  upsertPrescriptionLayoutSchema,
} from "@/modules/medical-records/schemas/prescription.schema"
import { renderPrescriptionHtml } from "@/modules/medical-records/utils/render-prescription"
import { sanitizePrescriptionHtml } from "@/modules/medical-records/utils/sanitize-prescription-html"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("canEditPrescription", () => {
  it("allows editing only while attendance is checked_in", () => {
    assert.equal(canEditPrescription("checked_in"), true)
    assert.equal(canEditPrescription("completed"), false)
    assert.equal(canEditPrescription("scheduled"), false)
  })
})

describe("sanitizePrescriptionHtml", () => {
  it("strips script tags and event handlers", () => {
    const dirty =
      '<p onclick="alert(1)">Ok</p><script>alert(2)</script><a href="javascript:alert(3)">x</a>'
    const clean = sanitizePrescriptionHtml(dirty)
    assert.equal(clean.includes("<script"), false)
    assert.equal(clean.includes("onclick"), false)
    assert.equal(clean.includes("javascript:"), false)
    assert.match(clean, /Ok/)
  })
})

describe("renderPrescriptionHtml", () => {
  it("replaces placeholders with snapshot values and body", () => {
    const html = renderPrescriptionHtml({
      layoutHtml: DEFAULT_PRESCRIPTION_LAYOUT_HTML,
      body: "<p>Dipirona 500mg — 1 cp 8/8h</p>",
      clinic: {
        id: VALID_UUID,
        name: "Clínica Exemplo",
        document: "12.345.678/0001-90",
        addressLine: "Rua A, 10",
        phone: "11999999999",
        email: "contato@exemplo.com",
      },
      patient: {
        id: VALID_UUID,
        name: "Maria Silva",
        document: "123.456.789-00",
      },
      professional: {
        id: VALID_UUID,
        name: "Dr. João",
        councilType: "CRM",
        councilNumber: "12345",
        councilState: "SP",
        specialty: "Clínica Geral",
      },
      issuedAt: new Date("2026-07-28T12:00:00.000Z"),
    })

    assert.match(html, /Clínica Exemplo/)
    assert.match(html, /Maria Silva/)
    assert.match(html, /Dipirona 500mg/)
    assert.match(html, /CRM 12345\/SP/)
    assert.equal(html.includes("{{body}}"), false)
  })
})

describe("prescription schemas", () => {
  it("accepts create payload", () => {
    const parsed = createPrescriptionSchema.parse({
      appointmentId: VALID_UUID,
      body: "<p>Receita</p>",
      plainText: "Receita",
    })
    assert.equal(parsed.plainText, "Receita")
  })

  it("rejects empty body", () => {
    assert.throws(() =>
      createPrescriptionSchema.parse({
        appointmentId: VALID_UUID,
        body: "   ",
        plainText: "   ",
      }),
    )
  })

  it("accepts issue and layout upsert", () => {
    assert.equal(
      issuePrescriptionSchema.parse({ id: VALID_UUID }).id,
      VALID_UUID,
    )
    assert.match(
      upsertPrescriptionLayoutSchema.parse({
        html: DEFAULT_PRESCRIPTION_LAYOUT_HTML,
      }).html,
      /{{body}}/,
    )
  })
})

describe("toPrescription", () => {
  it("maps repository row to domain type", () => {
    const now = new Date()
    const prescription = toPrescription({
      id: VALID_UUID,
      clinicId: VALID_UUID,
      patientId: VALID_UUID,
      appointmentId: VALID_UUID,
      professionalId: null,
      professionalName: null,
      status: "draft",
      body: "<p>x</p>",
      plainText: "x",
      layoutHtml: null,
      layoutVersion: null,
      clinicSnapshot: null,
      patientSnapshot: null,
      professionalSnapshot: null,
      issuedAt: null,
      appointmentStartsAt: now,
      createdAt: now,
      updatedAt: now,
    })
    assert.equal(prescription.status, "draft")
    assert.equal(prescription.plainText, "x")
  })
})
