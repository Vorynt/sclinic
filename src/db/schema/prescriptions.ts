import { sql } from "drizzle-orm"
import {
  boolean,
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
import { clinics } from "./clinics"
import { prescriptionStatusEnum } from "./enums"
import {
  auditBy,
  clinicIsolation,
  primaryUuid,
  softDelete,
  timestamps,
} from "./helpers"
import { patients } from "./patients"
import { professionals } from "./professionals"
import { sclinicAppRole } from "./rls"

/** Opaque JSON shape; validated in medical-records (ADR-008). */
export type PrescriptionLayoutDocumentModel = {
  version: 1
  blocks: unknown[]
}

/**
 * Frozen identity block copied onto a prescription at issue time.
 * Shape is enforced in the medical-records service/DTO layer.
 */
export type PrescriptionPartySnapshot = {
  id: string
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  addressLine?: string | null
  councilType?: string | null
  councilNumber?: string | null
  councilState?: string | null
  specialty?: string | null
  treatmentPronoun?: string | null
  logoUrl?: string | null
}

/**
 * Clinic-owned prescription templates (stacked-block DocumentModel).
 * Up to 3 active rows per clinic; one may be `isDefault`.
 * `html` is the compiled cache used at preview/issue.
 *
 * @see docs/adr/005-prescriptions.md
 * @see docs/adr/008-prescription-template-designer.md
 */
export const prescriptionLayouts = pgTable(
  "prescription_layouts",
  {
    id: primaryUuid(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    /** Display name in settings and template picker. */
    name: text("name").notNull(),
    /** Per-template edit counter; frozen onto issued prescriptions. */
    version: integer("version").notNull(),
    /** Source of truth — stacked blocks (ADR-008). */
    documentModel: jsonb("document_model")
      .$type<PrescriptionLayoutDocumentModel>()
      .notNull(),
    /** Compiled HTML cache; placeholders resolved at render/issue. */
    html: text("html").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    /** At most one default among active templates per clinic. */
    isDefault: boolean("is_default").default(false).notNull(),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    uniqueIndex("prescription_layouts_clinic_default_uidx")
      .on(t.clinicId)
      .where(
        sql`${t.deletedAt} IS NULL AND ${t.isActive} = true AND ${t.isDefault} = true`,
      ),
    index("prescription_layouts_clinic_idx").on(t.clinicId),
    index("prescription_layouts_clinic_active_idx")
      .on(t.clinicId)
      .where(sql`${t.deletedAt} IS NULL AND ${t.isActive} = true`),
    pgPolicy("prescription_layouts_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

/**
 * Simple prescription document. 0..N per appointment.
 * Draft: body editable; layout/snapshots null (preview uses live data).
 * Issued: body + layoutHtml + party snapshots frozen; immutable in service.
 *
 * @see docs/adr/005-prescriptions.md
 */
export const prescriptions = pgTable(
  "prescriptions",
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
    professionalId: uuid("professional_id").references(() => professionals.id, {
      onDelete: "set null",
    }),
    /**
     * Template chosen for this draft (null = clinic default / system).
     * Kept after issue for audit; render uses frozen layoutHtml.
     */
    layoutId: uuid("layout_id").references(() => prescriptionLayouts.id, {
      onDelete: "set null",
    }),
    status: prescriptionStatusEnum("status").default("draft").notNull(),
    /** Free-text body as HTML fragment injected into `{{body}}`. */
    body: text("body").notNull(),
    /** Derived plain text for list preview and search. */
    plainText: text("plain_text").notNull(),
    /**
     * Frozen letterhead HTML at issue time (system default copy or clinic custom).
     * Null while draft.
     */
    layoutHtml: text("layout_html"),
    /**
     * Clinic layout version used at issue; null = system default was frozen.
     * Null while draft.
     */
    layoutVersion: integer("layout_version"),
    clinicSnapshot: jsonb("clinic_snapshot").$type<PrescriptionPartySnapshot | null>(),
    patientSnapshot: jsonb(
      "patient_snapshot",
    ).$type<PrescriptionPartySnapshot | null>(),
    professionalSnapshot: jsonb(
      "professional_snapshot",
    ).$type<PrescriptionPartySnapshot | null>(),
    issuedAt: timestamp("issued_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
    ...softDelete,
    ...auditBy,
  },
  (t) => [
    index("prescriptions_clinic_patient_idx").on(t.clinicId, t.patientId),
    index("prescriptions_clinic_appointment_idx").on(
      t.clinicId,
      t.appointmentId,
    ),
    index("prescriptions_clinic_status_idx").on(t.clinicId, t.status),
    index("prescriptions_clinic_issued_at_idx").on(t.clinicId, t.issuedAt),
    pgPolicy("prescriptions_tenant_isolation", {
      as: "permissive",
      to: sclinicAppRole,
      for: "all",
      using: clinicIsolation(t.clinicId),
      withCheck: clinicIsolation(t.clinicId),
    }),
  ],
)

export type PrescriptionLayout = typeof prescriptionLayouts.$inferSelect
export type NewPrescriptionLayout = typeof prescriptionLayouts.$inferInsert
export type Prescription = typeof prescriptions.$inferSelect
export type NewPrescription = typeof prescriptions.$inferInsert
