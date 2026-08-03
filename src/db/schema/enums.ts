import { pgEnum } from "drizzle-orm/pg-core"

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
])

export const clinicSubscriptionStatusEnum = pgEnum("clinic_subscription_status", [
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
])

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "invited",
  "suspended",
  "removed",
])

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
  "resent",
])

export const professionalStatusEnum = pgEnum("professional_status", [
  "active",
  "inactive",
])

export const councilTypeEnum = pgEnum("council_type", [
  "CRM",
  "CRO",
  "COREN",
  "CRF",
  "OTHER",
])

/** Honorific / treatment pronoun shown before the professional's name. */
export const treatmentPronounEnum = pgEnum("treatment_pronoun", [
  "dr",
  "dra",
  "sr",
  "sra",
  "enf",
  "enfa",
])

export const affiliationTypeEnum = pgEnum("affiliation_type", [
  "attending",
  "coordinator",
  "locum",
  "resident",
])

export const affiliationStatusEnum = pgEnum("affiliation_status", [
  "active",
  "inactive",
])

export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "yearly"])

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
])

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "checked_in",
  "completed",
  "canceled",
  "no_show",
])

export const patientStatusEnum = pgEnum("patient_status", [
  "active",
  "inactive",
  "archived",
])

export const patientGenderEnum = pgEnum("patient_gender", [
  "female",
  "male",
  "other",
  "undisclosed",
])

export const appointmentTypeEnum = pgEnum("appointment_type", [
  "consultation",
  "follow_up",
  "procedure",
  "evaluation",
  "other",
])

export const auditStatusEnum = pgEnum("audit_status", ["success", "error"])

/** Clinical alert categories on the patient chart. */
export const clinicalAlertKindEnum = pgEnum("clinical_alert_kind", [
  "allergy",
  "restriction",
  "attention",
  "other",
])

export const clinicalAlertSeverityEnum = pgEnum("clinical_alert_severity", [
  "low",
  "medium",
  "high",
])

/** Clinical charge lifecycle (clinic receivables — not SaaS subscription). */
export const chargeStatusEnum = pgEnum("charge_status", [
  "pending",
  "paid",
  "canceled",
  "failed",
])

/**
 * How a clinical payment was settled.
 * `gateway` is reserved for in-app PIX/card via provider (e.g. Asaas).
 */
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "pix_manual",
  "card",
  "transfer",
  "other",
  "gateway",
  "courtesy",
])

/**
 * Why a clinical charge was priced this way (ADR-009).
 * `courtesy` / `return` settle at R$ 0 paid; do not infer from amount alone.
 */
export const chargeBillingKindEnum = pgEnum("charge_billing_kind", [
  "standard",
  "courtesy",
  "return",
])

/** Payment provider for clinical charges. MVP always uses `none`. */
export const paymentProviderEnum = pgEnum("payment_provider", [
  "none",
  "asaas",
])

/** Simple prescription lifecycle (medical-records). */
export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "draft",
  "issued",
])
