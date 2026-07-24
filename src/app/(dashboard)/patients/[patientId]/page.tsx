import { PatientOverviewPanel } from "@/modules/patients/components/PatientOverviewPanel"

type PatientDetailPageProps = {
  params: Promise<{ patientId: string }>
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { patientId } = await params

  return <PatientOverviewPanel patientId={patientId} />
}
