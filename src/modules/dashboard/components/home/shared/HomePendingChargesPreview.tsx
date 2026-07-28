"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { routes } from "@/config/routes"
import { useChargesQuery } from "@/modules/billing/hooks/use-charges"
import { formatCentsToBrl } from "@/modules/billing/utils/money"
import { HomeSection } from "@/modules/dashboard/components/home/shared/HomeSection"

const PREVIEW_LIMIT = 5

export function HomePendingChargesPreview() {
  const query = useChargesQuery({
    status: "pending",
    page: 1,
    pageSize: PREVIEW_LIMIT,
  })

  const charges = query.data?.items ?? []

  return (
    <HomeSection
      title="Cobranças pendentes"
      description="Próximas cobranças a receber."
    >
      {query.isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : charges.length === 0 ? (
        <div className="rounded-xl bg-muted/40 px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
          Nenhuma cobrança pendente.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl ring-1 ring-foreground/10">
          {charges.map((charge) => (
            <li
              key={charge.id}
              className="flex items-center justify-between gap-3 bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {charge.patientName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {format(charge.appointmentStartsAt, "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                {formatCentsToBrl(charge.amountCents)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button variant="link" size="sm" asChild>
          <Link href={routes.billing}>Ver faturamento</Link>
        </Button>
      </div>
    </HomeSection>
  )
}
