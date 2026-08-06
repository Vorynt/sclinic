import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { Permission } from "@/config/permissions"
import { canAccessProfessionalHours } from "@/modules/professionals/utils/professional-hours-access"

const PROF_A = "11111111-1111-4111-8111-111111111111"
const PROF_B = "22222222-2222-4222-8222-222222222222"

describe("canAccessProfessionalHours", () => {
  it("allows professionals.manage for any target", () => {
    assert.equal(
      canAccessProfessionalHours({
        permissions: [Permission.PROFESSIONALS_MANAGE],
        ownProfessionalId: null,
        targetProfessionalId: PROF_A,
      }),
      true,
    )
  })

  it("allows the linked professional to access their own hours", () => {
    assert.equal(
      canAccessProfessionalHours({
        permissions: [Permission.APPOINTMENTS_CREATE],
        ownProfessionalId: PROF_A,
        targetProfessionalId: PROF_A,
      }),
      true,
    )
  })

  it("denies access to another professional without manage", () => {
    assert.equal(
      canAccessProfessionalHours({
        permissions: [Permission.APPOINTMENTS_CREATE],
        ownProfessionalId: PROF_A,
        targetProfessionalId: PROF_B,
      }),
      false,
    )
  })

  it("denies when the user has no professional profile and no manage", () => {
    assert.equal(
      canAccessProfessionalHours({
        permissions: [Permission.APPOINTMENTS_CREATE],
        ownProfessionalId: null,
        targetProfessionalId: PROF_A,
      }),
      false,
    )
  })
})
