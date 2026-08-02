import type { Charge as ChargeRow, Payment as PaymentRow } from "@/db/schema"
import type {
  BillingKind,
  Charge,
  ChargeListItem,
  ChargeStatus,
  Payment,
  PaymentMethod,
  PaymentProvider,
} from "@/modules/billing/types/charge"

export function toCharge(row: ChargeRow): Charge {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    appointmentId: row.appointmentId,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    listAmountCents: row.listAmountCents,
    discountPercent: row.discountPercent,
    amountCents: row.amountCents,
    currency: row.currency,
    status: row.status as ChargeStatus,
    billingKind: row.billingKind as BillingKind,
    description: row.description,
    dueAt: row.dueAt,
    provider: row.provider as PaymentProvider,
    providerChargeId: row.providerChargeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toChargeListItem(params: {
  row: ChargeRow
  patientName: string
  appointmentStartsAt: Date
}): ChargeListItem {
  return {
    ...toCharge(params.row),
    patientName: params.patientName,
    appointmentStartsAt: params.appointmentStartsAt,
  }
}

export function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    clinicId: row.clinicId,
    chargeId: row.chargeId,
    amountCents: row.amountCents,
    method: row.method as PaymentMethod,
    paidAt: row.paidAt,
    provider: row.provider as PaymentProvider,
    providerPaymentId: row.providerPaymentId,
    notes: row.notes,
    recordedBy: row.recordedBy,
    createdAt: row.createdAt,
  }
}
