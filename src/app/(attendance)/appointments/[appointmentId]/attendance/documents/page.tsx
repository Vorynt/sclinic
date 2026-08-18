import { redirect } from "next/navigation"

import { buildAttendanceRedirectHref } from "@/modules/appointments/utils/agenda-href"

type AttendanceDocumentsRedirectPageProps = {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Legacy `/documents` → landing with documents sheet. */
export default async function AttendanceDocumentsRedirectPage({
  params,
  searchParams,
}: AttendanceDocumentsRedirectPageProps) {
  const { appointmentId } = await params
  redirect(
    buildAttendanceRedirectHref(appointmentId, await searchParams, "documents"),
  )
}
