"use server"

import { getAuthRequestContext } from "@/modules/authentication/utils/request-context"
import { appointmentIdSchema } from "@/modules/appointments/schemas/appointment.schema"
import { attendanceBootstrapService } from "@/modules/appointments/services/attendance-bootstrap.service"
import type { AttendanceBootstrap } from "@/modules/appointments/types/attendance-bootstrap"
import { toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function getAttendanceBootstrapAction(
  id: unknown,
): Promise<ApiResponse<AttendanceBootstrap>> {
  return toActionResult(async () => {
    const appointmentId = parseOrThrow(appointmentIdSchema, id)
    return attendanceBootstrapService.getByAppointmentId(
      appointmentId,
      await getAuthRequestContext(),
    )
  })
}
