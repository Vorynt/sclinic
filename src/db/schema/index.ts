/**
 * Drizzle schema barrel — multi-tenant clinic SaaS.
 *
 * Order of domain files mirrors rollout:
 * auth → clinics → clinic-hours → rbac → memberships → invitations →
 * professionals → billing → patients → appointments → clinical-notes →
 * patient-clinical-alerts → audit-logs.
 *
 * Deferred (not modeled yet): inventory.
 * Billing here is SaaS plans/subscriptions only — clinical charges later.
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
export * from "./billing"
export * from "./patients"
export * from "./appointments"
export * from "./clinical-notes"
export * from "./patient-clinical-alerts"
export * from "./audit-logs"
