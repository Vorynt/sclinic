import { sql } from "drizzle-orm"
import {
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { appointments } from "./appointments"
import { clinicServices } from "./clinic-services"
import { clinics } from "./clinics"
import {
  chargeBillingKindEnum,
  chargeStatusEnum,
  paymentMethodEnum,
  paymentProviderEnum,
} from "./enums"
import {
  auditBy,
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { patients } from "./patients"
import { sclinicAppRole } from "./rls"

/**
 * Clinical receivable (clinic ↔ patient), distinct from SaaS `subscriptions`.
 * Gateway columns are nullable for a future Asaas/PIX integration.
 */
export const charges = pgTable(
  "charges",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    appointmentId: uuid("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "restrict" }),
    /** Catalog reference at creation time (may be deleted later; use snapshot). */
    serviceId: uuid("service_id").references(() => clinicServices.id, {
      onDelete: "set null",
    }),
    /** Snapshot of service name (ADR-009). */
    serviceName: text("service_name"),
    /** List price before discount (cents). */
    listAmountCents: integer("list_amount_cents"),
    /** Discount applied 0–100. */
    discountPercent: integer("discount_percent").default(0).notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("BRL").notNull(),
    status: chargeStatusEnum("status").default("pending").notNull(),
    billingKind: chargeBillingKindEnum("billing_kind")
      .default("standard")
      .notNull(),
    description: text("description"),
    dueAt: timestamp("due_at", { withTimezone: true, mode: "date" }),
    provider: paymentProviderEnum("provider").default("none").notNull(),
    providerChargeId: text("provider_charge_id"),
    providerPayload: jsonb("provider_payload").$type<Record<
      string,
      unknown
    > | null>(),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    uniqueIndex("charges_appointment_active_uidx")
      .on(t.appointmentId)
      .where(
        sql`${t.deletedAt} IS NULL AND ${t.status} <> 'canceled'`,
      ),
    uniqueIndex("charges_provider_charge_id_uidx")
      .on(t.provider, t.providerChargeId)
      .where(sql`${t.providerChargeId} IS NOT NULL`),
    index("charges_clinic_status_idx").on(t.clinicId, t.status),
    index("charges_clinic_patient_idx").on(t.clinicId, t.patientId),
    index("charges_clinic_created_at_idx").on(t.clinicId, t.createdAt),
    index("charges_clinic_service_idx").on(t.clinicId, t.serviceId),
    pgPolicy("charges_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

/**
 * Settlement rows for a charge. MVP: one manual payment when marking paid.
 * Gateway webhooks can append rows later without rewriting the charge.
 */
export const payments = pgTable(
  "payments",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    chargeId: uuid("charge_id")
      .notNull()
      .references(() => charges.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    method: paymentMethodEnum("method").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }).notNull(),
    provider: paymentProviderEnum("provider").default("none").notNull(),
    providerPaymentId: text("provider_payment_id"),
    notes: text("notes"),
    recordedBy: text("recorded_by"),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("payments_provider_payment_id_uidx")
      .on(t.provider, t.providerPaymentId)
      .where(sql`${t.providerPaymentId} IS NOT NULL`),
    index("payments_clinic_charge_idx").on(t.clinicId, t.chargeId),
    index("payments_clinic_paid_at_idx").on(t.clinicId, t.paidAt),
    pgPolicy("payments_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type Charge = typeof charges.$inferSelect
export type NewCharge = typeof charges.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
