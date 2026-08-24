import { beforeEach, describe, expect, it } from "@jest/globals"

import { Permission } from "@/config/permissions"
import { requireClinic } from "@/modules/authentication/permissions/guards"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import { chargeService } from "@/modules/billing/services/charge.service"
import { clinicServiceService } from "@/modules/billing/services/clinic-service.service"
import { dashboardService } from "@/modules/dashboard/services/dashboard.service"
import { patientService } from "@/modules/patients/services/patient.service"
import { professionalService } from "@/modules/professionals/services/professional.service"
import { memberService } from "@/modules/users/services/member.service"
import type { AuthRequestContext } from "@/shared/auth"

jest.mock("@/modules/patients/services/patient.service", () => ({
  patientService: {
    countByClinic: jest.fn(async () => 0),
  },
}))

jest.mock("@/modules/appointments/services/appointment.service", () => ({
  appointmentService: {
    countInRange: jest.fn(async () => 0),
    list: jest.fn(async () => []),
  },
}))

jest.mock("@/modules/billing/services/charge.service", () => ({
  chargeService: {
    getSummary: jest.fn(async () => ({
      pendingTotalCents: 0,
      pendingCount: 0,
      paidThisMonthCents: 0,
      paidThisMonthCount: 0,
    })),
    listActiveByAppointmentIds: jest.fn(async () => []),
  },
}))

jest.mock("@/modules/professionals/services/professional.service", () => ({
  professionalService: {
    existsForScheduling: jest.fn(async () => false),
  },
}))

jest.mock("@/modules/billing/services/clinic-service.service", () => ({
  clinicServiceService: {
    existsActive: jest.fn(async () => false),
  },
}))

jest.mock("@/modules/users/services/member.service", () => ({
  memberService: {
    countActive: jest.fn(async () => 0),
  },
}))

jest.mock("@/modules/authentication/permissions/guards", () => ({
  requireClinic: jest.fn(async () => ({
    permissions: [] as string[],
  })),
}))

const ctx = {} as AuthRequestContext

describe("dashboardService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("aggregates owner home stats and setup flags in parallel", async () => {
    jest.mocked(patientService.countByClinic).mockResolvedValue(4)
    jest
      .mocked(appointmentService.countInRange)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(3)
    jest.mocked(chargeService.getSummary).mockResolvedValue({
      pendingTotalCents: 15000,
      pendingCount: 2,
      paidThisMonthCents: 9000,
      paidThisMonthCount: 1,
    })
    jest.mocked(professionalService.existsForScheduling).mockResolvedValue(true)
    jest.mocked(clinicServiceService.existsActive).mockResolvedValue(false)

    const stats = await dashboardService.getOwnerHomeStats(ctx)

    expect(stats.patientsCount).toBe(4)
    expect(stats.monthAppointmentsCount).toBe(12)
    expect(stats.billing.pendingCount).toBe(2)
    expect(stats.setup).toEqual({
      hasProfessional: true,
      hasService: false,
      hasPatient: true,
      hasAppointment: true,
    })
    expect(appointmentService.countInRange).toHaveBeenCalledTimes(2)
  })

  it("counts admin home patients and active members", async () => {
    jest.mocked(patientService.countByClinic).mockResolvedValue(8)
    jest.mocked(memberService.countActive).mockResolvedValue(5)

    await expect(dashboardService.getAdminHomeStats(ctx)).resolves.toEqual({
      patientsCount: 8,
      activeMembersCount: 5,
    })
  })

  it("skips charges on the reception board without financial permission", async () => {
    jest.mocked(appointmentService.list).mockResolvedValue([{ id: "a1" }] as never)
    jest.mocked(requireClinic).mockResolvedValue({
      permissions: [Permission.APPOINTMENTS_UPDATE],
    } as never)

    const board = await dashboardService.getReceptionDayBoard(
      {
        from: new Date("2026-08-24T00:00:00.000Z"),
        to: new Date("2026-08-25T00:00:00.000Z"),
      },
      ctx,
    )

    expect(board.appointments).toHaveLength(1)
    expect(board.charges).toEqual([])
    expect(chargeService.listActiveByAppointmentIds).not.toHaveBeenCalled()
  })

  it("loads active charges when the receptionist can see financial data", async () => {
    jest
      .mocked(appointmentService.list)
      .mockResolvedValue([{ id: "a1" }, { id: "a2" }] as never)
    jest.mocked(requireClinic).mockResolvedValue({
      permissions: [Permission.FINANCIAL_COLLECT],
    } as never)
    jest
      .mocked(chargeService.listActiveByAppointmentIds)
      .mockResolvedValue([{ id: "c1" }] as never)

    const board = await dashboardService.getReceptionDayBoard(
      {
        from: new Date("2026-08-24T00:00:00.000Z"),
        to: new Date("2026-08-25T00:00:00.000Z"),
      },
      ctx,
    )

    expect(chargeService.listActiveByAppointmentIds).toHaveBeenCalledWith(
      ["a1", "a2"],
      ctx,
    )
    expect(board.charges).toEqual([{ id: "c1" }])
  })
})
