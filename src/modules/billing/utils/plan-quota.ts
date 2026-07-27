/**
 * Plan quota dimensions and pure helpers (ADR-004).
 * Limits come from the owner's living subscription plan; usage is metered per clinic.
 */

export const PLAN_QUOTA_DIMENSIONS = [
  "users",
  "professionals",
  "storage",
] as const

export type PlanQuotaDimension = (typeof PLAN_QUOTA_DIMENSIONS)[number]

export type PlanQuotaLimits = {
  maxUsers: number | null
  maxProfessionals: number | null
  maxStorageBytes: number | null
}

export type PlanQuotaUsage = {
  users: number
  professionals: number
  storageBytes: number
}

export type ClinicPlanQuota = {
  clinicId: string
  planId: string | null
  planName: string | null
  limits: PlanQuotaLimits
  usage: PlanQuotaUsage
  /** usage > limit — clinic is in over_limit mode for the banner. */
  over: Record<PlanQuotaDimension, boolean>
  /** usage >= limit — next create on that dimension must fail. */
  atCapacity: Record<PlanQuotaDimension, boolean>
  isOverLimit: boolean
}

function exceeds(usage: number, limit: number | null): boolean {
  if (limit == null) return false
  return usage > limit
}

function atOrOver(usage: number, limit: number | null): boolean {
  if (limit == null) return false
  return usage >= limit
}

export function buildClinicPlanQuota(input: {
  clinicId: string
  planId: string | null
  planName: string | null
  limits: PlanQuotaLimits
  usage: PlanQuotaUsage
}): ClinicPlanQuota {
  const over = {
    users: exceeds(input.usage.users, input.limits.maxUsers),
    professionals: exceeds(
      input.usage.professionals,
      input.limits.maxProfessionals,
    ),
    storage: exceeds(input.usage.storageBytes, input.limits.maxStorageBytes),
  }

  const atCapacity = {
    users: atOrOver(input.usage.users, input.limits.maxUsers),
    professionals: atOrOver(
      input.usage.professionals,
      input.limits.maxProfessionals,
    ),
    storage: atOrOver(input.usage.storageBytes, input.limits.maxStorageBytes),
  }

  return {
    clinicId: input.clinicId,
    planId: input.planId,
    planName: input.planName,
    limits: input.limits,
    usage: input.usage,
    over,
    atCapacity,
    isOverLimit: over.users || over.professionals || over.storage,
  }
}

export function dimensionLimit(
  limits: PlanQuotaLimits,
  dimension: PlanQuotaDimension,
): number | null {
  switch (dimension) {
    case "users":
      return limits.maxUsers
    case "professionals":
      return limits.maxProfessionals
    case "storage":
      return limits.maxStorageBytes
  }
}

export function dimensionUsage(
  usage: PlanQuotaUsage,
  dimension: PlanQuotaDimension,
): number {
  switch (dimension) {
    case "users":
      return usage.users
    case "professionals":
      return usage.professionals
    case "storage":
      return usage.storageBytes
  }
}
