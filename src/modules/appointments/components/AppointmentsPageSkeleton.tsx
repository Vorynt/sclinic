import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

const CALENDAR_CELLS = 35

/** Calendar grid silhouette (month view). */
export function AppointmentsCalendarSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={`weekday-${index}`} className="mx-auto h-3 w-8" />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
        {Array.from({ length: CALENDAR_CELLS }, (_, index) => (
          <div
            key={`day-${index}`}
            className="flex min-h-20 flex-col gap-1 bg-background p-1 sm:min-h-28 sm:p-1.5"
          >
            <Skeleton className="size-5 shrink-0 self-end rounded-full" />
            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
              {index % 3 === 0 ? (
                <>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </>
              ) : null}
              {index % 5 === 0 ? <Skeleton className="h-3 w-3/5" /> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Full-page silhouette matching AppointmentsPanel. */
export function AppointmentsPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando agendamentos"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        titleClassName="h-7 w-40"
        descriptionClassName="h-4 w-80 max-w-full"
        actionClassName="h-9 w-44"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>

      <AppointmentsCalendarSkeleton />
    </div>
  )
}
