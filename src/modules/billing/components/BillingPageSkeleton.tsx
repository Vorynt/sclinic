import { PageHeaderSkeleton } from "@/components/status/PageHeaderSkeleton"
import { BillingSummaryCardsSkeleton } from "@/modules/billing/components/BillingSummaryCards"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_LIST_PAGE_SIZE } from "@/shared/validators"

function ChargesListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5"
        >
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function BillingPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando faturamento"
      className="flex flex-col gap-6"
    >
      <PageHeaderSkeleton
        hasAction={false}
        titleClassName="h-7 w-40"
        descriptionClassName="h-4 w-80 max-w-full"
      />
      <BillingSummaryCardsSkeleton />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-44" />
      </div>
      <ChargesListSkeleton rows={DEFAULT_LIST_PAGE_SIZE} />
    </div>
  )
}
