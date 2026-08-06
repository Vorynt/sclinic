import { redirect } from "next/navigation"

import { routes } from "@/config/routes"

type AttendancePrescriptionsRedirectPageProps = {
  params: Promise<{ appointmentId: string }>
}

/** Legacy `/prescriptions` → `/documents` (ADR-010 product copy). */
export default async function AttendancePrescriptionsRedirectPage({
  params,
}: AttendancePrescriptionsRedirectPageProps) {
  const { appointmentId } = await params
  redirect(routes.appointmentAttendanceDocuments(appointmentId))
}
