import type { LeaveOwnClinicInput } from "@/modules/users/schemas/account.schema"

export type LeaveOwnClinicDto = LeaveOwnClinicInput

export type LeaveOwnClinicResult = {
  leftCurrentClinic: boolean
}
