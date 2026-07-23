import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton"
import { TableSkeleton } from "@/components/status/TableSkeleton"

/** Full-page silhouette matching ProfessionalsPanel. */
export function ProfessionalsPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando profissionais"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        titleClassName="h-7 w-40"
        descriptionClassName="h-4 w-80 max-w-full"
        actionClassName="h-9 w-40"
      />
      <TableSkeleton columns={6} rows={8} />
    </div>
  )
}
