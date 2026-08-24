import type { Appointment } from "@/modules/appointments/types/appointment"
import type { BillingSummary } from "@/modules/billing/types/charge"
import type { Charge } from "@/modules/billing/types/charge"
import type { OwnerSetupFlags } from "@/modules/dashboard/utils/owner-setup-progress"

export type OwnerHomeStats = {
  patientsCount: number
  monthAppointmentsCount: number
  billing: BillingSummary
  setup: OwnerSetupFlags
}

export type AdminHomeStats = {
  patientsCount: number
  activeMembersCount: number
}

export type ReceptionDayBoard = {
  appointments: Appointment[]
  charges: Charge[]
}
