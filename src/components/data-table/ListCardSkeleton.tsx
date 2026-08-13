import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

type ListCardSkeletonProps = {
  rows?: number
  className?: string
}

/**
 * Dense card-row silhouette for mobile list loading (ChargeCard-like).
 */
export function ListCardSkeleton({
  rows = DEFAULT_LIST_PAGE_SIZE,
  className,
}: ListCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Carregando lista"
      className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <Skeleton className="size-8 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  )
}
