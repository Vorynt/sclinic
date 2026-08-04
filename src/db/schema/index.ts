/**
 * Drizzle schema barrel — multi-tenant clinic SaaS.
 *
 * Order of domain files mirrors rollout:
 * auth → clinics → clinic-hours → rbac → memberships → invitations →
 * professionals → professional-hours → billing (SaaS) → patients → clinic-services →
 * appointments → schedule-blocks → appointment-waitlist →
 * clinical-notes → patient-clinical-alerts → vital-signs → prescriptions →
 * clinical-billing → audit-logs.
 *
 * Deferred (not modeled yet): inventory.
 * `billing.ts` = SaaS plans/subscriptions; `clinical-billing.ts` = clinic receivables.
 */

export * from "./enums"
export * from "./helpers"
export * from "./rls"
export * from "./auth"
export * from "./clinics"
export * from "./clinic-hours"
export * from "./rbac"
export * from "./memberships"
export * from "./invitations"
export * from "./professionals"
export * from "./professional-hours"
export * from "./billing"
export * from "./patients"
export * from "./clinic-services"
export * from "./appointments"
export * from "./schedule-blocks"
export * from "./appointment-waitlist"
export * from "./clinical-notes"
export * from "./patient-clinical-alerts"
export * from "./vital-signs"
export * from "./prescriptions"
export * from "./clinical-billing"
export * from "./audit-logs"
