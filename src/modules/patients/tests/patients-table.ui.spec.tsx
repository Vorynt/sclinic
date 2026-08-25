/** @jest-environment jsdom */

import { beforeEach, describe, expect, it } from "@jest/globals"
import { render, screen } from "@testing-library/react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Permission } from "@/config/permissions"
import { PatientsTable } from "@/modules/patients/components/PatientsTable"
import { useDeletePatientMutation } from "@/modules/patients/hooks/use-patient-mutations"
import { usePatientsQuery } from "@/modules/patients/hooks/use-patients"
import type { Patient } from "@/modules/patients/types/patient"
import { useAuth } from "@/providers/AuthProvider"

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/modules/patients/hooks/use-patients", () => ({
  usePatientsQuery: jest.fn(),
}))

jest.mock("@/modules/patients/hooks/use-patient-mutations", () => ({
  useDeletePatientMutation: jest.fn(),
}))

const patient: Patient = {
  id: "11111111-1111-4111-8111-111111111111",
  clinicId: "clinic-1",
  name: "Ana Silva",
  cpf: "00000000000",
  status: "active",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
}

function mockAuth(granted: string[]) {
  jest.mocked(useAuth).mockReturnValue({
    auth: null,
    isLoading: false,
    isAuthenticated: true,
    can: (...required) => required.every((key) => granted.includes(key)),
    canAny: (...required) => required.some((key) => granted.includes(key)),
  })
}

function renderTable() {
  return render(
    <TooltipProvider>
      <PatientsTable
        filters={{ page: 1, pageSize: 20 }}
        onPageChange={jest.fn()}
        onEdit={jest.fn()}
      />
    </TooltipProvider>,
  )
}

describe("PatientsTable permission gates", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(usePatientsQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      isFetching: false,
      data: { items: [patient], page: 1, pageSize: 20, total: 1 },
      refetch: jest.fn(),
    } as never)
    jest.mocked(useDeletePatientMutation).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    } as never)
  })

  it("hides edit and delete without patients.write", () => {
    mockAuth([Permission.PATIENTS_READ])
    renderTable()

    expect(screen.queryByRole("button", { name: "Editar" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Remover" })).toBeNull()
  })

  it("shows edit and delete with patients.write", () => {
    mockAuth([Permission.PATIENTS_READ, Permission.PATIENTS_WRITE])
    renderTable()

    expect(
      screen.getAllByRole("button", { name: "Editar" }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole("button", { name: "Remover" }).length,
    ).toBeGreaterThan(0)
  })
})
