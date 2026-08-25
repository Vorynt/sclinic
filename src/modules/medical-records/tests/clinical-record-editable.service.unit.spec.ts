import { beforeEach, describe, expect, it } from "@jest/globals"

import { Permission } from "@/config/permissions"
import type { AuthContextWithClinic } from "@/modules/authentication/permissions/guards"
import { requirePermission } from "@/modules/authentication/permissions/guards"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import { clinicalNoteRepository } from "@/modules/medical-records/repositories/clinical-note.repository"
import { prescriptionRepository } from "@/modules/medical-records/repositories/prescription.repository"
import { vitalSignsRepository } from "@/modules/medical-records/repositories/vital-signs.repository"
import { clinicalNoteService } from "@/modules/medical-records/services/clinical-note.service"
import { prescriptionLayoutService } from "@/modules/medical-records/services/prescription-layout.service"
import { prescriptionService } from "@/modules/medical-records/services/prescription.service"
import { vitalSignsService } from "@/modules/medical-records/services/vital-signs.service"
import { clinicService } from "@/modules/clinics/services/clinic.service"
import { patientService } from "@/modules/patients/services/patient.service"
import { professionalService } from "@/modules/professionals/services/professional.service"
import type { AuthRequestContext } from "@/shared/auth"

jest.mock("@/modules/authentication/permissions/guards", () => ({
  requirePermission: jest.fn(),
}))

jest.mock("@/modules/appointments/services/appointment.service", () => ({
  appointmentService: {
    getById: jest.fn(),
  },
}))

jest.mock("@/modules/medical-records/repositories/clinical-note.repository", () => ({
  clinicalNoteRepository: {
    findByAppointmentId: jest.fn(),
  },
}))

jest.mock("@/modules/medical-records/repositories/vital-signs.repository", () => ({
  vitalSignsRepository: {
    findByAppointmentId: jest.fn(),
  },
}))

jest.mock("@/modules/medical-records/repositories/prescription.repository", () => ({
  prescriptionRepository: {
    listByAppointment: jest.fn(),
  },
}))

jest.mock("@/modules/medical-records/services/prescription-layout.service", () => ({
  prescriptionLayoutService: {
    listTemplateOptions: jest.fn(),
    resolveDefaultLayout: jest.fn(),
  },
}))

jest.mock("@/modules/clinics/services/clinic.service", () => ({
  clinicService: {
    getById: jest.fn(),
  },
}))

jest.mock("@/modules/patients/services/patient.service", () => ({
  patientService: {
    getById: jest.fn(),
  },
}))

jest.mock("@/modules/professionals/services/professional.service", () => ({
  professionalService: {
    getByIdForRecords: jest.fn(),
  },
}))

const ctx = {} as AuthRequestContext
const APPOINTMENT_ID = "11111111-1111-4111-8111-111111111111"
const PATIENT_ID = "22222222-2222-4222-8222-222222222222"
const CLINIC_ID = "33333333-3333-4333-8333-333333333333"

function authWith(permissions: string[]): AuthContextWithClinic {
  return {
    permissions,
    clinicId: CLINIC_ID,
    user: { id: "user-1" },
    membership: { roleKey: "manager" },
    session: { activeClinicId: CLINIC_ID },
  } as AuthContextWithClinic
}

const checkedInAppointment = {
  id: APPOINTMENT_ID,
  clinicId: CLINIC_ID,
  patientId: PATIENT_ID,
  professionalId: null,
  professionalName: null,
  status: "checked_in",
}

describe("clinical record editable flag", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(appointmentService.getById)
      .mockResolvedValue(checkedInAppointment as never)
    jest
      .mocked(clinicalNoteRepository.findByAppointmentId)
      .mockResolvedValue(null)
    jest.mocked(vitalSignsRepository.findByAppointmentId).mockResolvedValue(null)
    jest.mocked(prescriptionRepository.listByAppointment).mockResolvedValue([])
    jest
      .mocked(prescriptionLayoutService.listTemplateOptions)
      .mockResolvedValue([])
    jest
      .mocked(prescriptionLayoutService.resolveDefaultLayout)
      .mockResolvedValue({ html: "<html></html>" } as never)
    jest.mocked(clinicService.getById).mockResolvedValue({
      id: CLINIC_ID,
      name: "Clínica",
      tradeName: null,
      document: null,
      email: null,
      phone: null,
    } as never)
    jest.mocked(patientService.getById).mockResolvedValue({
      id: PATIENT_ID,
      name: "Ana",
      cpf: "00000000000",
    } as never)
    jest
      .mocked(professionalService.getByIdForRecords)
      .mockResolvedValue(null)
  })

  it("marks notes/vitals/prescriptions read-only without records.write", async () => {
    jest
      .mocked(requirePermission)
      .mockResolvedValue(authWith([Permission.RECORDS_READ]))

    const [note, vitals, prescriptions] = await Promise.all([
      clinicalNoteService.getForAppointment(APPOINTMENT_ID, ctx),
      vitalSignsService.getForAppointment(APPOINTMENT_ID, ctx),
      prescriptionService.listForAppointment(
        { appointmentId: APPOINTMENT_ID },
        ctx,
      ),
    ])

    expect(note.editable).toBe(false)
    expect(vitals.editable).toBe(false)
    expect(prescriptions.editable).toBe(false)
  })

  it("keeps notes/vitals/prescriptions editable with records.write while checked in", async () => {
    jest.mocked(requirePermission).mockResolvedValue(
      authWith([Permission.RECORDS_READ, Permission.RECORDS_WRITE]),
    )

    const [note, vitals, prescriptions] = await Promise.all([
      clinicalNoteService.getForAppointment(APPOINTMENT_ID, ctx),
      vitalSignsService.getForAppointment(APPOINTMENT_ID, ctx),
      prescriptionService.listForAppointment(
        { appointmentId: APPOINTMENT_ID },
        ctx,
      ),
    ])

    expect(note.editable).toBe(true)
    expect(vitals.editable).toBe(true)
    expect(prescriptions.editable).toBe(true)
  })
})
