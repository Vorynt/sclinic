/** @jest-environment jsdom */

import { beforeEach, describe, expect, it } from "@jest/globals"
import { render, screen } from "@testing-library/react"

import { AttendanceSecondaryActions } from "@/modules/appointments/components/AttendanceSecondaryActions"
import { Permission } from "@/config/permissions"
import { useAuth } from "@/providers/AuthProvider"

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/modules/appointments/hooks/use-attendance-panel", () => ({
  useAttendancePanel: () => ({
    panel: null,
    setPanel: jest.fn(),
  }),
}))

function mockAuth(granted: string[]) {
  jest.mocked(useAuth).mockReturnValue({
    auth: null,
    isLoading: false,
    isAuthenticated: true,
    can: (...required) => required.every((key) => granted.includes(key)),
    canAny: (...required) => required.some((key) => granted.includes(key)),
  })
}

describe("AttendanceSecondaryActions permission gates", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("hides retorno without appointments.create", () => {
    mockAuth([Permission.APPOINTMENTS_UPDATE])

    render(<AttendanceSecondaryActions />)

    expect(screen.queryByRole("button", { name: "Retorno" })).toBeNull()
    expect(screen.getByRole("button", { name: "Vitais" })).toBeTruthy()
  })

  it("shows retorno with appointments.create", () => {
    mockAuth([Permission.APPOINTMENTS_CREATE])

    render(<AttendanceSecondaryActions />)

    expect(screen.getByRole("button", { name: "Retorno" })).toBeTruthy()
  })
})
