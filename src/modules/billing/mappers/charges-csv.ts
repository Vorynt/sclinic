import {
  BILLING_KIND_LABELS,
  CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/billing/constants/charges"
import type { ChargeListItem } from "@/modules/billing/types/charge"
import { formatCentsToBrl } from "@/modules/billing/utils/money"

function csvCell(value: string): string {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function formatInstant(value: Date | null): string {
  if (!value) return ""
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value)
}

export function chargesToCsv(items: ChargeListItem[]): string {
  const header = [
    "Paciente",
    "Serviço",
    "Consulta",
    "Vencimento",
    "Status",
    "Tipo",
    "Valor",
    "Forma de pagamento",
  ]

  const rows = items.map((item) => [
    item.patientName,
    item.serviceName ?? "",
    formatInstant(item.appointmentStartsAt),
    formatInstant(item.dueAt),
    CHARGE_STATUS_LABELS[item.status] ?? item.status,
    BILLING_KIND_LABELS[item.billingKind] ?? item.billingKind,
    formatCentsToBrl(item.amountCents),
    item.paymentMethod
      ? (PAYMENT_METHOD_LABELS[item.paymentMethod] ?? item.paymentMethod)
      : "",
  ])

  return [header, ...rows]
    .map((row) => row.map((cell) => csvCell(cell)).join(";"))
    .join("\n")
}

export function chargesExportFilename(params: {
  from: string | null
  to: string | null
  periodAll: boolean
}): string {
  if (params.periodAll) return "faturamento-completo.csv"
  if (params.from && params.to) {
    return `faturamento-${params.from}-${params.to}.csv`
  }
  return "faturamento.csv"
}
