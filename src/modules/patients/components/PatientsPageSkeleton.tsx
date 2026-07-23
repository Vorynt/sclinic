import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton"
import { TableSkeleton } from "@/components/status/TableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

/** Full-page silhouette matching PatientsPanel. */
export function PatientsPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando pacientes"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        titleClassName="h-7 w-32"
        descriptionClassName="h-4 w-72 max-w-full"
        actionClassName="h-9 w-36"
      />
      <Skeleton className="h-9 w-full max-w-sm" />
      <TableSkeleton columns={5} rows={8} />
    </div>
  )
}
