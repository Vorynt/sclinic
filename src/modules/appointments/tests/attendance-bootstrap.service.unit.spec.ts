import { beforeEach, describe, expect, it } from "@jest/globals"

import { attendanceBootstrapService } from "@/modules/appointments/services/attendance-bootstrap.service"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import { clinicalNoteService } from "@/modules/medical-records/services/clinical-note.service"
import { vitalSignsService } from "@/modules/medical-records/services/vital-signs.service"
import { patientService } from "@/modules/patients/services/patient.service"
import type { AuthRequestContext } from "@/shared/auth"

jest.mock("@/modules/appointments/services/appointment.service", () => ({
  appointmentService: {
    getById: jest.fn(async () => ({ id: "", patientId: "" })),
  },
}))

jest.mock("@/modules/patients/services/patient.service", () => ({
  patientService: {
    getById: jest.fn(async () => ({ id: "", name: "" })),
  },
}))

jest.mock("@/modules/medical-records/services/vital-signs.service", () => ({
  vitalSignsService: {
    getForAppointment: jest.fn(async () => ({ vitals: null })),
    listPatientHistory: jest.fn(async () => []),
  },
}))

jest.mock("@/modules/medical-records/services/clinical-note.service", () => ({
  clinicalNoteService: {
    listPatientHistory: jest.fn(async () => []),
  },
}))

const ctx = {} as AuthRequestContext

describe("attendanceBootstrapService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("loads appointment context in parallel after resolving the visit", async () => {
    jest
      .mocked(appointmentService.getById)
      .mockResolvedValue({ id: "apt-1", patientId: "pat-1" } as never)
    jest
      .mocked(patientService.getById)
      .mockResolvedValue({ id: "pat-1", name: "Ana" } as never)
    jest
      .mocked(vitalSignsService.getForAppointment)
      .mockResolvedValue({ vitals: { id: "v-now" } } as never)
    jest
      .mocked(vitalSignsService.listPatientHistory)
      .mockResolvedValue([{ id: "v-old" }] as never)
    jest
      .mocked(clinicalNoteService.listPatientHistory)
      .mockResolvedValue([{ id: "n-old" }] as never)

    const bootstrap = await attendanceBootstrapService.getByAppointmentId(
      "apt-1",
      ctx,
    )

    expect(appointmentService.getById).toHaveBeenCalledWith("apt-1", ctx)
    expect(patientService.getById).toHaveBeenCalledWith("pat-1", ctx)
    expect(vitalSignsService.getForAppointment).toHaveBeenCalledWith(
      "apt-1",
      ctx,
    )
    expect(vitalSignsService.listPatientHistory).toHaveBeenCalledWith(
      { patientId: "pat-1", excludeAppointmentId: "apt-1" },
      ctx,
    )
    expect(bootstrap.patient).toEqual({ id: "pat-1", name: "Ana" })
    expect(bootstrap.previousVitals).toEqual([{ id: "v-old" }])
    expect(bootstrap.previousNotes).toEqual([{ id: "n-old" }])
  })
})
