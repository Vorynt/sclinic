import {
  BILLING_KIND_LABELS,
  CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/billing/constants/charges"
import type { ExportChargesInput } from "@/modules/billing/schemas/charge.schema"
import { formatISODate } from "@/utils/date"

export type ChargeExportFilterItem = {
  label: string
  value: string
}

function periodLabel(filters: ExportChargesInput): string {
  if (filters.periodAll) return "Todo o período"
  if (filters.from && filters.to) {
    return `${formatISODate(filters.from)} — ${formatISODate(filters.to)}`
  }
  if (filters.from) return `A partir de ${formatISODate(filters.from)}`
  if (filters.to) return `Até ${formatISODate(filters.to)}`
  return "Mês corrente"
}

export function describeChargeExportFilters(params: {
  filters: ExportChargesInput
  serviceName?: string | null
  patientName?: string | null
}): ChargeExportFilterItem[] {
  const { filters, serviceName, patientName } = params
  const items: ChargeExportFilterItem[] = [
    { label: "Período", value: periodLabel(filters) },
  ]

  if (filters.q) {
    items.push({ label: "Busca", value: filters.q })
  }
  if (filters.status) {
    items.push({
      label: "Status",
      value: CHARGE_STATUS_LABELS[filters.status] ?? filters.status,
    })
  }
  if (filters.overdue) {
    items.push({ label: "Vencidas", value: "Somente vencidas" })
  }
  if (filters.billingKind) {
    items.push({
      label: "Tipo",
      value: BILLING_KIND_LABELS[filters.billingKind] ?? filters.billingKind,
    })
  }
  if (filters.method) {
    items.push({
      label: "Pagamento",
      value: PAYMENT_METHOD_LABELS[filters.method] ?? filters.method,
    })
  }
  if (filters.serviceId) {
    items.push({
      label: "Serviço",
      value: serviceName?.trim() || "Serviço selecionado",
    })
  }
  if (filters.patientId) {
    items.push({
      label: "Paciente",
      value: patientName?.trim() || "Paciente filtrado",
    })
  }

  return items
}
