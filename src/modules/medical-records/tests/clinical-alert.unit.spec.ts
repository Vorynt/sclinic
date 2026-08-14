import { describe, expect, it } from "@jest/globals"

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
    expect(parsed.label).toBe("Dipirona")
    expect(parsed.severity).toBe("medium")
    expect(parsed.notes).toBe(undefined)
  })

  it("accepts optional notes and high severity", () => {
    const parsed = createClinicalAlertSchema.parse({
      patientId: VALID_UUID,
      kind: "attention",
      label: "Gestante",
      severity: "high",
      notes: "  2º trimestre  ",
    })
    expect(parsed.severity).toBe("high")
    expect(parsed.notes).toBe("2º trimestre")
  })

  it("rejects empty label", () => {
    expect(createClinicalAlertSchema.safeParse({
        patientId: VALID_UUID,
        kind: "allergy",
        label: "   ",
      }).success).toBe(false)
  })

  it("rejects invalid kind", () => {
    expect(createClinicalAlertSchema.safeParse({
        patientId: VALID_UUID,
        kind: "unknown",
        label: "X",
      }).success).toBe(false)
  })
})

describe("listClinicalAlertsSchema / deleteClinicalAlertSchema", () => {
  it("requires valid patient and alert ids", () => {
    expect(listClinicalAlertsSchema.safeParse({ patientId: VALID_UUID }).success).toBe(true)
    expect(deleteClinicalAlertSchema.safeParse({ id: VALID_UUID }).success).toBe(true)
    expect(listClinicalAlertsSchema.safeParse({ patientId: "bad" }).success).toBe(false)
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
    expect(alert.kind).toBe("restriction")
    expect(alert.label).toBe("Anticoagulante")
    expect(alert.severity).toBe("high")
    expect(alert.notes).toBe("Warfarina")
  })
})

describe("clinical alert labels", () => {
  it("exposes Portuguese labels for kinds and severities", () => {
    expect(CLINICAL_ALERT_KIND_LABELS.allergy).toBe("Alergia")
    expect(CLINICAL_ALERT_SEVERITY_LABELS.high).toBe("Alta")
  })
})
