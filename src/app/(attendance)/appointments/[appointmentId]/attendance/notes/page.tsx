import { redirect } from "next/navigation"

import { buildAttendanceRedirectHref } from "@/modules/appointments/utils/agenda-href"

type AttendanceNotesRedirectPageProps = {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Legacy `/notes` → notes-first landing. */
export default async function AttendanceNotesRedirectPage({
  params,
  searchParams,
}: AttendanceNotesRedirectPageProps) {
  const { appointmentId } = await params
  redirect(buildAttendanceRedirectHref(appointmentId, await searchParams))
}
