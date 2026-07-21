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
