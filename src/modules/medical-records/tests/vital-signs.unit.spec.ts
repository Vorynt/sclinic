import { describe, expect, it } from "@jest/globals"

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
    expect(canEditVitalSigns("checked_in")).toBe(true)
    expect(canEditVitalSigns("completed")).toBe(false)
    expect(canEditVitalSigns("scheduled")).toBe(false)
  })
})

describe("upsertVitalSignsSchema", () => {
  it("accepts a partial reading with blood pressure", () => {
    const parsed = upsertVitalSignsSchema.parse({
      appointmentId: VALID_UUID,
      systolicMmHg: "120",
      diastolicMmHg: "80",
    })
    expect(parsed.systolicMmHg).toBe(120)
    expect(parsed.diastolicMmHg).toBe(80)
  })

  it("rejects empty payload", () => {
    expect(upsertVitalSignsSchema.safeParse({
        appointmentId: VALID_UUID,
      }).success).toBe(false)
  })

  it("rejects systolic without diastolic", () => {
    expect(upsertVitalSignsSchema.safeParse({
        appointmentId: VALID_UUID,
        systolicMmHg: 120,
      }).success).toBe(false)
  })

  it("accepts weight and height", () => {
    const parsed = upsertVitalSignsSchema.parse({
      appointmentId: VALID_UUID,
      weightKg: "70.5",
      heightCm: "170",
    })
    expect(parsed.weightKg).toBe(70.5)
    expect(parsed.heightCm).toBe(170)
  })
})

describe("listPatientVitalSignsSchema", () => {
  it("requires a valid patient id", () => {
    expect(listPatientVitalSignsSchema.safeParse({
        patientId: VALID_UUID,
      }).success).toBe(true)
    expect(listPatientVitalSignsSchema.safeParse({ patientId: "bad" }).success).toBe(false)
  })

  it("accepts an optional exclude appointment id", () => {
    expect(listPatientVitalSignsSchema.safeParse({
        patientId: VALID_UUID,
        excludeAppointmentId: VALID_UUID,
      }).success).toBe(true)
  })
})

describe("calculateBmi", () => {
  it("computes BMI rounded to one decimal", () => {
    expect(calculateBmi(70, 175)).toBe(22.9)
  })

  it("returns null when height or weight is missing", () => {
    expect(calculateBmi(null, 175)).toBe(null)
    expect(calculateBmi(70, null)).toBe(null)
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
    expect(vitals.systolicMmHg).toBe(120)
    expect(vitals.temperatureC).toBe(36.5)
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
    expect(rows.length).toBe(1)
    expect(rows[0]?.value).toBe("120/80 mmHg")
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
