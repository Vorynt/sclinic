export type ChargeStatus = "pending" | "paid" | "canceled" | "failed"

export type ManualPaymentMethod =
  | "cash"
  | "pix_manual"
  | "card"
  | "transfer"
  | "other"

export type BillingKind = "standard" | "courtesy" | "return"

export type PaymentMethod = ManualPaymentMethod | "gateway" | "courtesy"

export type PaymentProvider = "none" | "asaas"

export type Charge = {
  id: string
  clinicId: string
  patientId: string
  appointmentId: string
  serviceId: string | null
  serviceName: string | null
  listAmountCents: number | null
  discountPercent: number
  amountCents: number
  currency: string
  status: ChargeStatus
  billingKind: BillingKind
  description: string | null
  dueAt: Date | null
  provider: PaymentProvider
  providerChargeId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ChargeListItem = Charge & {
  patientName: string
  appointmentStartsAt: Date
}

export type Payment = {
  id: string
  clinicId: string
  chargeId: string
  amountCents: number
  method: PaymentMethod
  paidAt: Date
  provider: PaymentProvider
  providerPaymentId: string | null
  notes: string | null
  recordedBy: string | null
  createdAt: Date
}

export type BillingSummary = {
  pendingTotalCents: number
  pendingCount: number
  paidThisMonthCents: number
  paidThisMonthCount: number
}

export type DelinquentPatient = {
  patientId: string
  patientName: string
  totalCents: number
  count: number
  oldestDueAt: Date
}
