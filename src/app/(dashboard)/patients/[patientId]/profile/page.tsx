import { PatientProfilePanel } from "@/modules/patients/components/PatientProfilePanel"

type PatientProfilePageProps = {
  params: Promise<{ patientId: string }>
}

export default async function PatientProfilePage({
  params,
}: PatientProfilePageProps) {
  const { patientId } = await params

  return <PatientProfilePanel patientId={patientId} />
}
