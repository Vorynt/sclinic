import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  CLINICAL_ALERT_KIND_LABELS,
  CLINICAL_ALERT_SEVERITY_LABELS,
} from "@/modules/medical-records/constants/clinical-alerts"
import { toClinicalAlert } from "@/modules/medical-records/mappers/clinical-alert.mapper"
import {
  createClinicalAlertSchema,
  deleteClinicalAlertSchema,
  listClinicalAlertsSchema,
} from "@/modules/medical-records/schemas/clinical-alert.schema"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("createClinicalAlertSchema", () => {
  it("accepts allergy with default severity", () => {
    const parsed = createClinicalAlertSchema.parse({
      patientId: VALID_UUID,
      kind: "allergy",
      label: " Dipirona ",
    })
    assert.equal(parsed.label, "Dipirona")
    assert.equal(parsed.severity, "medium")
    assert.equal(parsed.notes, undefined)
  })

  it("accepts optional notes and high severity", () => {
    const parsed = createClinicalAlertSchema.parse({
      patientId: VALID_UUID,
      kind: "attention",
      label: "Gestante",
      severity: "high",
      notes: "  2º trimestre  ",
    })
    assert.equal(parsed.severity, "high")
    assert.equal(parsed.notes, "2º trimestre")
  })

  it("rejects empty label", () => {
    assert.equal(
      createClinicalAlertSchema.safeParse({
        patientId: VALID_UUID,
        kind: "allergy",
        label: "   ",
      }).success,
      false,
    )
  })

  it("rejects invalid kind", () => {
    assert.equal(
      createClinicalAlertSchema.safeParse({
        patientId: VALID_UUID,
        kind: "unknown",
        label: "X",
      }).success,
      false,
    )
  })
})

describe("listClinicalAlertsSchema / deleteClinicalAlertSchema", () => {
  it("requires valid patient and alert ids", () => {
    assert.equal(
      listClinicalAlertsSchema.safeParse({ patientId: VALID_UUID }).success,
      true,
    )
    assert.equal(
      deleteClinicalAlertSchema.safeParse({ id: VALID_UUID }).success,
      true,
    )
    assert.equal(
      listClinicalAlertsSchema.safeParse({ patientId: "bad" }).success,
      false,
    )
  })
})

describe("toClinicalAlert mapper", () => {
  it("maps row fields to the domain type", () => {
    const now = new Date()
    const alert = toClinicalAlert({
      id: VALID_UUID,
      clinicId: VALID_UUID,
      patientId: VALID_UUID,
      kind: "restriction",
      label: "Anticoagulante",
      severity: "high",
      notes: "Warfarina",
      createdAt: now,
      updatedAt: now,
    })
    assert.equal(alert.kind, "restriction")
    assert.equal(alert.label, "Anticoagulante")
    assert.equal(alert.severity, "high")
    assert.equal(alert.notes, "Warfarina")
  })
})

describe("clinical alert labels", () => {
  it("exposes Portuguese labels for kinds and severities", () => {
    assert.equal(CLINICAL_ALERT_KIND_LABELS.allergy, "Alergia")
    assert.equal(CLINICAL_ALERT_SEVERITY_LABELS.high, "Alta")
  })
})
