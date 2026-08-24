import { appointmentService } from "@/modules/appointments/services/appointment.service"
import type { AttendanceBootstrap } from "@/modules/appointments/types/attendance-bootstrap"
import { clinicalNoteService } from "@/modules/medical-records/services/clinical-note.service"
import { vitalSignsService } from "@/modules/medical-records/services/vital-signs.service"
import { patientService } from "@/modules/patients/services/patient.service"
import type { AuthRequestContext } from "@/shared/auth"

export const attendanceBootstrapService = {
  async getByAppointmentId(
    appointmentId: string,
    ctx: AuthRequestContext,
  ): Promise<AttendanceBootstrap> {
    const appointment = await appointmentService.getById(appointmentId, ctx)

    const [patient, currentVitals, previousVitals, previousNotes] =
      await Promise.all([
        patientService.getById(appointment.patientId, ctx),
        vitalSignsService.getForAppointment(appointmentId, ctx),
        vitalSignsService.listPatientHistory(
          {
            patientId: appointment.patientId,
            excludeAppointmentId: appointment.id,
          },
          ctx,
        ),
        clinicalNoteService.listPatientHistory(
          {
            patientId: appointment.patientId,
            excludeAppointmentId: appointment.id,
          },
          ctx,
        ),
      ])

    return {
      appointment,
      patient,
      currentVitals,
      previousVitals,
      previousNotes,
    }
  },
}
