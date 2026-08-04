import { redirect } from "next/navigation"

import { routes } from "@/config/routes"

type PatientPrescriptionsRedirectPageProps = {
  params: Promise<{ patientId: string }>
}

/** Legacy `/prescriptions` → `/documents` (ADR-010 product copy). */
export default async function PatientPrescriptionsRedirectPage({
  params,
}: PatientPrescriptionsRedirectPageProps) {
  const { patientId } = await params
  redirect(routes.patientDetailDocuments(patientId))
}
