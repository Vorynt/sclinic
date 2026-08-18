import { redirect } from "next/navigation"

import { buildAttendanceRedirectHref } from "@/modules/appointments/utils/agenda-href"

type AttendancePrescriptionsRedirectPageProps = {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Legacy `/prescriptions` → documents sheet (ADR-010 product copy). */
export default async function AttendancePrescriptionsRedirectPage({
  params,
  searchParams,
}: AttendancePrescriptionsRedirectPageProps) {
  const { appointmentId } = await params
  redirect(
    buildAttendanceRedirectHref(appointmentId, await searchParams, "documents"),
  )
}
