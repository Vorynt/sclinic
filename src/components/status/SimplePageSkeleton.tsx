import { Skeleton } from "@/components/ui/skeleton"

type SimplePageSkeletonProps = {
  titleClassName?: string
  descriptionClassName?: string
}

/**
 * Silhouette for simple title + description pages
 * (dashboard, settings placeholders).
 */
export function SimplePageSkeleton({
  titleClassName = "h-7 w-36",
  descriptionClassName = "h-4 w-80 max-w-full",
}: SimplePageSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Carregando página"
      className="flex flex-col gap-2"
    >
      <Skeleton className={titleClassName} />
      <Skeleton className={descriptionClassName} />
    </div>
  )
}
