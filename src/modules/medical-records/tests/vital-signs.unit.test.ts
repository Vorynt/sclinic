import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { canEditVitalSigns } from "@/modules/medical-records/constants/vital-signs"
import { toVitalSigns } from "@/modules/medical-records/mappers/vital-signs.mapper"
import {
  listPatientVitalSignsSchema,
  upsertVitalSignsSchema,
} from "@/modules/medical-records/schemas/vital-signs.schema"
import { calculateBmi } from "@/modules/medical-records/utils/bmi"
import { formatVitalSignsSummary } from "@/modules/medical-records/utils/format-vital-signs"
import { AppError, ErrorCode } from "@/shared/errors"

const VALID_UUID = "11111111-1111-4111-8111-111111111111"

describe("canEditVitalSigns", () => {
  it("allows editing only while attendance is checked_in", () => {
    assert.equal(canEditVitalSigns("checked_in"), true)
    assert.equal(canEditVitalSigns("completed"), false)
    assert.equal(canEditVitalSigns("scheduled"), false)
  })
})

describe("upsertVitalSignsSchema", () => {
  it("accepts a partial reading with blood pressure", () => {
    const parsed = upsertVitalSignsSchema.parse({
      appointmentId: VALID_UUID,
      systolicMmHg: "120",
      diastolicMmHg: "80",
    })
    assert.equal(parsed.systolicMmHg, 120)
    assert.equal(parsed.diastolicMmHg, 80)
  })

  it("rejects empty payload", () => {
    assert.equal(
      upsertVitalSignsSchema.safeParse({
        appointmentId: VALID_UUID,
      }).success,
      false,
    )
  })

  it("rejects systolic without diastolic", () => {
    assert.equal(
      upsertVitalSignsSchema.safeParse({
        appointmentId: VALID_UUID,
        systolicMmHg: 120,
      }).success,
      false,
    )
  })

  it("accepts weight and height", () => {
    const parsed = upsertVitalSignsSchema.parse({
      appointmentId: VALID_UUID,
      weightKg: "70.5",
      heightCm: "170",
    })
    assert.equal(parsed.weightKg, 70.5)
    assert.equal(parsed.heightCm, 170)
  })
})

describe("listPatientVitalSignsSchema", () => {
  it("requires a valid appointment id", () => {
    assert.equal(
      listPatientVitalSignsSchema.safeParse({
        appointmentId: VALID_UUID,
      }).success,
      true,
    )
    assert.equal(
      listPatientVitalSignsSchema.safeParse({ appointmentId: "bad" }).success,
      false,
    )
  })
})

describe("calculateBmi", () => {
  it("computes BMI rounded to one decimal", () => {
    assert.equal(calculateBmi(70, 175), 22.9)
  })

  it("returns null when height or weight is missing", () => {
    assert.equal(calculateBmi(null, 175), null)
    assert.equal(calculateBmi(70, null), null)
  })
})

describe("toVitalSigns mapper", () => {
  it("maps repository row fields", () => {
    const now = new Date()
    const vitals = toVitalSigns({
      id: VALID_UUID,
      clinicId: VALID_UUID,
      patientId: VALID_UUID,
      appointmentId: VALID_UUID,
      professionalId: null,
      professionalName: null,
      systolicMmHg: 120,
      diastolicMmHg: 80,
      heartRateBpm: 72,
      respiratoryRate: null,
      temperatureC: 36.5,
      weightKg: 70,
      heightCm: 170,
      spo2Percent: 98,
      appointmentStartsAt: now,
      createdAt: now,
      updatedAt: now,
    })
    assert.equal(vitals.systolicMmHg, 120)
    assert.equal(vitals.temperatureC, 36.5)
  })
})

describe("formatVitalSignsSummary", () => {
  it("formats blood pressure and skips empty fields", () => {
    const now = new Date()
    const rows = formatVitalSignsSummary({
      id: VALID_UUID,
      clinicId: VALID_UUID,
      patientId: VALID_UUID,
      appointmentId: VALID_UUID,
      professionalId: null,
      professionalName: null,
      systolicMmHg: 120,
      diastolicMmHg: 80,
      heartRateBpm: null,
      respiratoryRate: null,
      temperatureC: null,
      weightKg: null,
      heightCm: null,
      spo2Percent: null,
      appointmentStartsAt: now,
      createdAt: now,
      updatedAt: now,
    })
    assert.equal(rows.length, 1)
    assert.equal(rows[0]?.value, "120/80 mmHg")
  })
})

describe("vital signs edit guard", () => {
  it("blocks upsert when status is not checked_in", () => {
    function assertEditable(status: Parameters<typeof canEditVitalSigns>[0]) {
      if (!canEditVitalSigns(status)) {
        throw new AppError(ErrorCode.CONFLICT, {
          message:
            "Só é possível editar sinais vitais enquanto o atendimento está em andamento.",
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
