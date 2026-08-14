import { describe, expect, it } from "@jest/globals"

import {
  canCreateScheduleBlock,
  canDeleteScheduleBlock,
} from "@/modules/appointments/utils/schedule-block-access"

const OWN = "11111111-1111-4111-8111-111111111111"
const OTHER = "22222222-2222-4222-8222-222222222222"

describe("canCreateScheduleBlock", () => {
  it("allows doctor to block own agenda", () => {
    expect(canCreateScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        targetProfessionalId: OWN,
      }).ok).toBe(true)
  })

  it("denies doctor blocking another professional", () => {
    const result = canCreateScheduleBlock({
      roleKey: "clinician",
      ownProfessionalId: OWN,
      targetProfessionalId: OTHER,
    })
    expect(result.ok).toBe(false)
  })

  it("denies doctor creating clinic-wide block", () => {
    const result = canCreateScheduleBlock({
      roleKey: "clinician",
      ownProfessionalId: OWN,
      targetProfessionalId: null,
    })
    expect(result.ok).toBe(false)
  })

  it("allows receptionist clinic-wide and any professional", () => {
    expect(canCreateScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        targetProfessionalId: null,
      }).ok).toBe(true)
    expect(canCreateScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        targetProfessionalId: OTHER,
      }).ok).toBe(true)
  })
})

describe("canDeleteScheduleBlock", () => {
  it("allows doctor to remove own block", () => {
    expect(canDeleteScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        blockProfessionalId: OWN,
      }).ok).toBe(true)
  })

  it("denies doctor removing another professional block", () => {
    expect(canDeleteScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        blockProfessionalId: OTHER,
      }).ok).toBe(false)
  })

  it("denies doctor removing clinic-wide block", () => {
    expect(canDeleteScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        blockProfessionalId: null,
      }).ok).toBe(false)
  })

  it("allows receptionist to remove clinic-wide and any block", () => {
    expect(canDeleteScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        blockProfessionalId: null,
      }).ok).toBe(true)
    expect(canDeleteScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        blockProfessionalId: OTHER,
      }).ok).toBe(true)
  })
})
