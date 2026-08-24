import { addMonths, startOfMonth } from "date-fns"

import { Permission } from "@/config/permissions"
import { hasAnyPermission } from "@/core/permissions/check"
import { appointmentService } from "@/modules/appointments/services/appointment.service"
import { requireClinic } from "@/modules/authentication/permissions/guards"
import { chargeService } from "@/modules/billing/services/charge.service"
import { clinicServiceService } from "@/modules/billing/services/clinic-service.service"
import { OWNER_SETUP_APPOINTMENT_COUNT_RANGE } from "@/modules/dashboard/constants/owner-setup-missions"
import type {
  AdminHomeStats,
  OwnerHomeStats,
  ReceptionDayBoard,
} from "@/modules/dashboard/types/home-stats"
import { patientService } from "@/modules/patients/services/patient.service"
import { professionalService } from "@/modules/professionals/services/professional.service"
import { memberService } from "@/modules/users/services/member.service"
import type { AuthRequestContext } from "@/shared/auth"

const FINANCIAL_VIEW_OR_COLLECT = [
  Permission.FINANCIAL_VIEW,
  Permission.FINANCIAL_COLLECT,
  Permission.FINANCIAL_MANAGE,
] as const

export const dashboardService = {
  async getOwnerHomeStats(ctx: AuthRequestContext): Promise<OwnerHomeStats> {
    const monthFrom = startOfMonth(new Date())
    const monthTo = addMonths(monthFrom, 1)

    const [
      patientsCount,
      monthAppointmentsCount,
      billing,
      hasProfessional,
      hasService,
      setupAppointmentsCount,
    ] = await Promise.all([
      patientService.countByClinic(ctx),
      appointmentService.countInRange(
        { from: monthFrom, to: monthTo, excludeCanceled: true },
        ctx,
      ),
      chargeService.getSummary(ctx),
      professionalService.existsForScheduling(ctx),
      clinicServiceService.existsActive(ctx),
      appointmentService.countInRange(
        {
          from: OWNER_SETUP_APPOINTMENT_COUNT_RANGE.from,
          to: OWNER_SETUP_APPOINTMENT_COUNT_RANGE.to,
          excludeCanceled: true,
        },
        ctx,
      ),
    ])

    return {
      patientsCount,
      monthAppointmentsCount,
      billing,
      setup: {
        hasProfessional,
        hasService,
        hasPatient: patientsCount > 0,
        hasAppointment: setupAppointmentsCount > 0,
      },
    }
  },

  async getAdminHomeStats(ctx: AuthRequestContext): Promise<AdminHomeStats> {
    const [patientsCount, activeMembersCount] = await Promise.all([
      patientService.countByClinic(ctx),
      memberService.countActive(ctx),
    ])

    return { patientsCount, activeMembersCount }
  },

  async getReceptionDayBoard(
    filters: { from: Date; to: Date },
    ctx: AuthRequestContext,
  ): Promise<ReceptionDayBoard> {
    const appointments = await appointmentService.list(filters, ctx)
    const auth = await requireClinic(ctx)
    const canSeeCharges = hasAnyPermission(
      auth.permissions,
      FINANCIAL_VIEW_OR_COLLECT,
    )

    const charges =
      canSeeCharges && appointments.length > 0
        ? await chargeService.listActiveByAppointmentIds(
            appointments.map((appointment) => appointment.id),
            ctx,
          )
        : []

    return { appointments, charges }
  },
}
