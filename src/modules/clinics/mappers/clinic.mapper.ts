import type { Clinic as ClinicRow } from "@/db/schema"
import type {
  Clinic,
  ClinicSubscriptionStatus,
} from "@/modules/clinics/types/clinic"

const SUBSCRIPTION_STATUSES = new Set<ClinicSubscriptionStatus>([
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
])

function toSubscriptionStatus(value: unknown): ClinicSubscriptionStatus {
  if (
    typeof value === "string" &&
    SUBSCRIPTION_STATUSES.has(value as ClinicSubscriptionStatus)
  ) {
    return value as ClinicSubscriptionStatus
  }
  return "none"
}

export function toClinic(row: ClinicRow): Clinic {
  return {
    id: row.id,
    name: row.name,
    tradeName: row.tradeName,
    document: row.document,
    email: row.email,
    phone: row.phone,
    website: row.website,
    timezone: row.timezone,
    subscriptionStatus: toSubscriptionStatus(row.subscriptionStatus),
    addressStreet: row.addressStreet,
    addressNumber: row.addressNumber,
    addressComplement: row.addressComplement,
    addressNeighborhood: row.addressNeighborhood,
    addressCity: row.addressCity,
    addressState: row.addressState,
    addressZip: row.addressZip,
  }
}
