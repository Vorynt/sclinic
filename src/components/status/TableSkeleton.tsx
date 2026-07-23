import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type TableSkeletonProps = {
  columns: number
  rows?: number
  className?: string
}

/**
 * Table silhouette (header + body rows) for list-style pages.
 */
export function TableSkeleton({
  columns,
  rows = 8,
  className,
}: TableSkeletonProps) {
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  } as const

  return (
    <div
      role="status"
      aria-label="Carregando tabela"
      className={cn("w-full overflow-hidden rounded-md border", className)}
    >
      <div
        className="grid gap-4 border-b bg-muted/40 px-4 py-3"
        style={gridStyle}
      >
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={`head-${index}`} className="h-4 w-full" />
        ))}
      </div>

      {Array.from({ length: rows }, (_, row) => (
        <div
          key={`row-${row}`}
          className="grid gap-4 border-b px-4 py-3 last:border-b-0"
          style={gridStyle}
        >
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton
              key={`cell-${row}-${col}`}
              className={cn(
                "h-4 w-full",
                col === columns - 1 && "justify-self-end w-16",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
