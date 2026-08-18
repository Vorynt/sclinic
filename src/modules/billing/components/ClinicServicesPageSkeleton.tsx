import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton"
import { TableSkeleton } from "@/components/status/TableSkeleton"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

/** Full-page silhouette matching ClinicServicesPanel. */
export function ClinicServicesPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando serviços"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        titleClassName="h-7 w-32"
        descriptionClassName="h-4 w-80 max-w-full"
        actionClassName="h-9 w-36"
      />
      <TableSkeleton columns={4} rows={DEFAULT_LIST_PAGE_SIZE} />
    </div>
  )
}
