import { redirect } from "next/navigation"

import { buildAttendanceRedirectHref } from "@/modules/appointments/utils/agenda-href"

type AttendanceVitalsRedirectPageProps = {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Legacy `/vitals` → landing with vitals sheet. */
export default async function AttendanceVitalsRedirectPage({
  params,
  searchParams,
}: AttendanceVitalsRedirectPageProps) {
  const { appointmentId } = await params
  redirect(
    buildAttendanceRedirectHref(appointmentId, await searchParams, "vitals"),
  )
}
