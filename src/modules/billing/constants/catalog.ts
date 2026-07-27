/**
 * Canonical SaaS plan catalog — mirrored in Stripe via metadata `sclinic_plan`
 * and Price lookup_key `sclinic_<slug>_monthly`.
 */
export type PlanCatalogEntry = {
  slug: string
  name: string
  description: string
  /** Fallback until Stripe sync runs. */
  priceCents: number
  currency: "BRL"
  billingCycle: "monthly"
  maxUsers: number
  maxProfessionals: number
  maxStorageBytes: number
  lookupKey: string
}

export const PLAN_CATALOG: readonly PlanCatalogEntry[] = [
  {
    slug: "essencial",
    name: "Essencial",
    description: "Para clínicas começando a digitalizar o atendimento.",
    priceCents: 9900,
    currency: "BRL",
    billingCycle: "monthly",
    maxUsers: 3,
    maxProfessionals: 2,
    maxStorageBytes: 1 * 1024 * 1024 * 1024,
    lookupKey: "sclinic_essencial_monthly",
  },
  {
    slug: "profissional",
    name: "Profissional",
    description: "Operação completa com mais usuários e profissionais.",
    priceCents: 19900,
    currency: "BRL",
    billingCycle: "monthly",
    maxUsers: 10,
    maxProfessionals: 8,
    maxStorageBytes: 2 * 1024 * 1024 * 1024 - 1,
    lookupKey: "sclinic_profissional_monthly",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    description: "Limites ampliados para redes e alto volume.",
    priceCents: 39900,
    currency: "BRL",
    billingCycle: "monthly",
    maxUsers: 50,
    maxProfessionals: 40,
    maxStorageBytes: 2 * 1024 * 1024 * 1024 - 1,
    lookupKey: "sclinic_enterprise_monthly",
  },
] as const

export function planNameFromSlug(slug: string): string | null {
  return PLAN_CATALOG.find((p) => p.slug === slug)?.name ?? null
}

export function planSlugFromName(name: string): string | null {
  return PLAN_CATALOG.find((p) => p.name === name)?.slug ?? null
}
