import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton"
import { TableSkeleton } from "@/components/status/TableSkeleton"

/** Full-page silhouette matching TeamPanel. */
export function TeamPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando equipe"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        titleClassName="h-7 w-24"
        descriptionClassName="h-4 w-56 max-w-full"
        actionClassName="h-9 w-36"
      />
      <TableSkeleton columns={5} rows={6} />
    </div>
  )
}
