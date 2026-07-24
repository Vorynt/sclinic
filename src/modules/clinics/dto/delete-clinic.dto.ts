import type { DeleteClinicInput } from "@/modules/clinics/schemas/clinic.schema"

export type DeleteClinicDto = DeleteClinicInput

export type DeleteClinicResult = {
  /** Where the client should navigate after a successful wipe. */
  redirectTo: "/home" | "/onboarding/plan"
}
