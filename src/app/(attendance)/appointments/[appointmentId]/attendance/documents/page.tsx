import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"
import { Permission } from "@/config/permissions"
import { PrescriptionsPanel } from "@/modules/medical-records/components/PrescriptionsPanel"
import { PermissionProvider } from "@/providers/PermissionProvider"

type AttendanceDocumentsPageProps = {
  params: Promise<{ appointmentId: string }>
}

export default async function AttendanceDocumentsPage({
  params,
}: AttendanceDocumentsPageProps) {
  const { appointmentId } = await params

  return (
    <PermissionProvider
      permission={Permission.RECORDS_READ}
      fallback={<ForbiddenBlock />}
    >
      <PrescriptionsPanel appointmentId={appointmentId} />
    </PermissionProvider>
  )
}
