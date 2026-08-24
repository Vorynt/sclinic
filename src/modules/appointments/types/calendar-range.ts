import type { Appointment } from "@/modules/appointments/types/appointment"
import type { ScheduleBlock } from "@/modules/appointments/types/schedule-block"
import type { ClinicWeeklyHours } from "@/modules/clinics/types/clinic-hours"

export type CalendarRange = {
  appointments: Appointment[]
  scheduleBlocks: ScheduleBlock[]
  weeklyHours: ClinicWeeklyHours | null
}
