import { describe, expect, it } from "@jest/globals"

import { Permission } from "@/config/permissions"
import { canAccessProfessionalHours } from "@/modules/professionals/utils/professional-hours-access"

const PROF_A = "11111111-1111-4111-8111-111111111111"
const PROF_B = "22222222-2222-4222-8222-222222222222"

describe("canAccessProfessionalHours", () => {
  it("allows professionals.manage for any target", () => {
    expect(canAccessProfessionalHours({
        permissions: [Permission.PROFESSIONALS_MANAGE],
        ownProfessionalId: null,
        targetProfessionalId: PROF_A,
      })).toBe(true)
  })

  it("allows the linked professional to access their own hours", () => {
    expect(canAccessProfessionalHours({
        permissions: [Permission.APPOINTMENTS_CREATE],
        ownProfessionalId: PROF_A,
        targetProfessionalId: PROF_A,
      })).toBe(true)
  })

  it("denies access to another professional without manage", () => {
    expect(canAccessProfessionalHours({
        permissions: [Permission.APPOINTMENTS_CREATE],
        ownProfessionalId: PROF_A,
        targetProfessionalId: PROF_B,
      })).toBe(false)
  })

  it("denies when the user has no professional profile and no manage", () => {
    expect(canAccessProfessionalHours({
        permissions: [Permission.APPOINTMENTS_CREATE],
        ownProfessionalId: null,
        targetProfessionalId: PROF_A,
      })).toBe(false)
  })
})
