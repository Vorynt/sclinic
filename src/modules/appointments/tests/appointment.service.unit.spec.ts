import { beforeEach, describe, expect, it } from "@jest/globals"

import { Permission } from "@/config/permissions"
import { requireAnyPermission, requirePermission } from "@/modules/authentication/permissions/guards"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { AuthRequestContext } from "@/shared/auth"
import { AppError, ErrorCode, isAppError } from "@/shared/errors"

jest.mock("@/modules/authentication/permissions/guards", () => ({
  requirePermission: jest.fn(),
  requireAnyPermission: jest.fn(),
}))

jest.mock("@/modules/appointments/repositories/appointment.repository", () => ({
  appointmentRepository: {
    findById: jest.fn(),
  },
}))

jest.mock("@/modules/billing/services/charge.service", () => ({
  chargeService: {
    cancelPendingForAppointment: jest.fn(),
  },
}))

jest.mock("@/modules/audit/emit", () => ({
  recordAudit: jest.fn(),
  auditErrorFields: jest.fn(() => ({})),
}))

jest.mock("@/core/logger", () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}))

jest.mock("@/core/realtime", () => ({
  publishClinicOps: jest.fn(),
}))

const ctx = {} as AuthRequestContext
const APPOINTMENT_ID = "11111111-1111-4111-8111-111111111111"

describe("appointmentService.cancel", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects cancel without appointments.delete even when update is granted", async () => {
    jest.mocked(requirePermission).mockImplementation(async (_ctx, ...required) => {
      throw new AppError(ErrorCode.FORBIDDEN, { meta: { required } })
    })
    jest.mocked(requireAnyPermission).mockImplementation(async () => {
      throw new Error("cancel must not use requireAnyPermission")
    })

    try {
      await appointmentService.cancel({ id: APPOINTMENT_ID }, ctx)
      throw new Error("expected to throw")
    } catch (error) {
      if (error instanceof Error && error.message === "expected to throw") {
        throw error
      }
      expect(isAppError(error) && error.code === ErrorCode.FORBIDDEN).toBe(true)
    }

    expect(requirePermission).toHaveBeenCalledWith(
      ctx,
      Permission.APPOINTMENTS_DELETE,
    )
    expect(requireAnyPermission).not.toHaveBeenCalled()
  })
})
