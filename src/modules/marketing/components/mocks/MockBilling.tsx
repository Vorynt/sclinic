import { CurrencyCircleDollarIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import {
  MOCK_BILLING_CHARGES,
  MOCK_BILLING_SUMMARY,
} from "@/modules/marketing/constants/mock-data"

type MockBillingProps = {
  className?: string
}

export function MockBilling({ className }: MockBillingProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="grid gap-2 sm:grid-cols-3">
        {MOCK_BILLING_SUMMARY.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5">
            <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="mt-1 font-heading text-lg font-semibold tracking-tight text-foreground tabular-nums">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-2 border-b border-border/70 bg-muted/30 px-3 py-2">
          <CurrencyCircleDollarIcon
            className="size-3.5 text-primary"
            weight="duotone"
            aria-hidden="true"
          />
          <p className="text-xs font-medium text-foreground">Cobranças recentes</p>
        </div>
        <ul className="divide-y divide-border/70">
          {MOCK_BILLING_CHARGES.map((charge) => (
            <li
              key={`${charge.patientName}-${charge.date}`}
              className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {charge.patientName}
                </p>
                <p className="truncate text-[0.7rem] text-muted-foreground">
                  {charge.description} · {charge.date}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                {charge.amount}
              </p>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[0.65rem] font-medium",
                  charge.status === "paid" &&
                    "bg-chart-2/15 text-chart-4",
                  charge.status === "pending" &&
                    "bg-primary/10 text-primary",
                  charge.status === "canceled" &&
                    "bg-muted text-muted-foreground",
                )}>
                {charge.statusLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
