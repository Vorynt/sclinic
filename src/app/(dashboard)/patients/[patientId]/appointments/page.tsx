import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { PatientAppointmentsSection } from "@/modules/appointments/components/PatientAppointmentsSection"
import { PermissionProvider } from "@/providers/PermissionProvider"

type PatientAppointmentsPageProps = {
  params: Promise<{ patientId: string }>
}

export default async function PatientAppointmentsPage({
  params,
}: PatientAppointmentsPageProps) {
  const { patientId } = await params

  return (
    <PermissionProvider
      permissions={[
        Permission.APPOINTMENTS_CREATE,
        Permission.APPOINTMENTS_UPDATE,
        Permission.APPOINTMENTS_DELETE,
      ]}
      mode="any"
      fallback={<ForbiddenBlock />}
    >
      <PatientAppointmentsSection patientId={patientId} />
    </PermissionProvider>
  )
}
