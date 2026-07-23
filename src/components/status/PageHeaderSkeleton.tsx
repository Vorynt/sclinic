import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type PageHeaderSkeletonProps = {
  /** Mimics the primary action button on the right. */
  hasAction?: boolean
  /** Approximate title width. */
  titleClassName?: string
  /** Approximate description width. */
  descriptionClassName?: string
  /** Approximate action button width. */
  actionClassName?: string
}

/**
 * Silhouette for the standard dashboard page header
 * (title + description + optional primary action).
 */
export function PageHeaderSkeleton({
  hasAction = true,
  titleClassName = "h-7 w-40",
  descriptionClassName = "h-4 w-64 max-w-full",
  actionClassName = "h-9 w-36",
}: PageHeaderSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className={titleClassName} />
        <Skeleton className={descriptionClassName} />
      </div>
      {hasAction ? (
        <Skeleton className={cn("shrink-0", actionClassName)} />
      ) : null}
    </div>
  )
}
