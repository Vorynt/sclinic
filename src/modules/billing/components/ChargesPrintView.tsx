"use client"

import { PulseIcon } from "@phosphor-icons/react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect } from "react"

import { LoadingScreen } from "@/components/status/LoadingScreen"
import { QueryErrorState } from "@/components/status/QueryErrorState"
import { Button } from "@/components/ui/button"
import {
  BILLING_KIND_LABELS,
  CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/billing/constants/charges"
import { useExportChargesQuery } from "@/modules/billing/hooks/use-charges"
import { useClinicServiceQuery } from "@/modules/billing/hooks/use-clinic-services"
import type { ExportChargesInput } from "@/modules/billing/schemas/charge.schema"
import { describeChargeExportFilters } from "@/modules/billing/utils/charge-export-filters"
import { formatCentsToBrl } from "@/modules/billing/utils/money"

type ChargesPrintViewProps = {
  filters: ExportChargesInput
  autoPrint?: boolean
}

function formatDateTime(value: Date | null) {
  if (!value) return "—"
  return format(value, "dd/MM/yyyy HH:mm", { locale: ptBR })
}

function SclinicMark() {
  return (
    <div className="flex items-center gap-2.5 text-neutral-500">
      <span className="flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
        <PulseIcon className="size-5" weight="bold" aria-hidden />
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight">
        sclinic
      </span>
    </div>
  )
}

export function ChargesPrintView({
  filters,
  autoPrint = true,
}: ChargesPrintViewProps) {
  const query = useExportChargesQuery(filters)
  const serviceQuery = useClinicServiceQuery(filters.serviceId ?? "", {
    enabled: Boolean(filters.serviceId),
  })
  const isPreparing =
    query.isLoading ||
    (Boolean(filters.serviceId) && serviceQuery.isLoading)

  useEffect(() => {
    if (!autoPrint || isPreparing || !query.data) return
    const timer = window.setTimeout(() => {
      window.print()
    }, 400)
    return () => window.clearTimeout(timer)
  }, [autoPrint, isPreparing, query.data])

  if (isPreparing) {
    return (
      <LoadingScreen
        message="Estamos carregando seus dados…"
        description="Montando o relatório de faturamento com os filtros selecionados."
      />
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="p-8">
        <QueryErrorState
          description="Não foi possível carregar as cobranças para impressão."
          onRetry={() => {
            void query.refetch()
          }}
          isRetrying={query.isFetching}
        />
      </div>
    )
  }

  const { clinicName, items } = query.data
  const totalCents = items.reduce((sum, item) => sum + item.amountCents, 0)
  const generatedAt = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })
  const filterItems = describeChargeExportFilters({
    filters,
    serviceName: serviceQuery.data?.name,
    patientName: items[0]?.patientName,
  })

  return (
    <div className="mx-auto max-w-5xl bg-white px-6 py-8 text-black">
      {!autoPrint ? (
        <div className="mb-6 flex items-center justify-between print:hidden">
          <p className="text-sm text-neutral-600">Visualização para impressão</p>
          <Button type="button" size="sm" onClick={() => window.print()}>
            Imprimir
          </Button>
        </div>
      ) : null}

      <header className="mb-6 border-b border-neutral-200 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.18em] text-neutral-400 uppercase">
              Relatório de faturamento
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {clinicName}
            </h1>
          </div>
          <SclinicMark />
        </div>

        <p className="mt-3 text-sm text-neutral-600">
          Gerado em {generatedAt}
          <span className="mx-1.5 text-neutral-300">·</span>
          {items.length} cobrança{items.length === 1 ? "" : "s"}
          <span className="mx-1.5 text-neutral-300">·</span>
          Total {formatCentsToBrl(totalCents)}
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
          {filterItems.map((item) => (
            <div key={item.label}>
              <dt className="text-[0.65rem] font-medium tracking-wide text-neutral-400 uppercase">
                {item.label}
              </dt>
              <dd className="text-sm text-neutral-800">{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Nenhuma cobrança neste recorte.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left">
              <th className="py-2 pr-3 font-medium">Paciente</th>
              <th className="py-2 pr-3 font-medium">Serviço</th>
              <th className="py-2 pr-3 font-medium">Consulta</th>
              <th className="py-2 pr-3 font-medium">Vencimento</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Pagamento</th>
              <th className="py-2 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-200">
                <td className="py-2 pr-3">{item.patientName}</td>
                <td className="py-2 pr-3">{item.serviceName ?? "—"}</td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {formatDateTime(item.appointmentStartsAt)}
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">
                  {item.dueAt
                    ? format(item.dueAt, "dd/MM/yyyy", { locale: ptBR })
                    : "—"}
                </td>
                <td className="py-2 pr-3">
                  {CHARGE_STATUS_LABELS[item.status] ?? item.status}
                  {item.billingKind !== "standard"
                    ? ` · ${BILLING_KIND_LABELS[item.billingKind]}`
                    : ""}
                </td>
                <td className="py-2 pr-3">
                  {item.paymentMethod
                    ? (PAYMENT_METHOD_LABELS[item.paymentMethod] ??
                      item.paymentMethod)
                    : "—"}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatCentsToBrl(item.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
