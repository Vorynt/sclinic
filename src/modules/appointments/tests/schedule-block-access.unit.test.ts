import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canCreateScheduleBlock,
  canDeleteScheduleBlock,
} from "@/modules/appointments/utils/schedule-block-access"

const OWN = "11111111-1111-4111-8111-111111111111"
const OTHER = "22222222-2222-4222-8222-222222222222"

describe("canCreateScheduleBlock", () => {
  it("allows doctor to block own agenda", () => {
    assert.equal(
      canCreateScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        targetProfessionalId: OWN,
      }).ok,
      true,
    )
  })

  it("denies doctor blocking another professional", () => {
    const result = canCreateScheduleBlock({
      roleKey: "clinician",
      ownProfessionalId: OWN,
      targetProfessionalId: OTHER,
    })
    assert.equal(result.ok, false)
  })

  it("denies doctor creating clinic-wide block", () => {
    const result = canCreateScheduleBlock({
      roleKey: "clinician",
      ownProfessionalId: OWN,
      targetProfessionalId: null,
    })
    assert.equal(result.ok, false)
  })

  it("allows receptionist clinic-wide and any professional", () => {
    assert.equal(
      canCreateScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        targetProfessionalId: null,
      }).ok,
      true,
    )
    assert.equal(
      canCreateScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        targetProfessionalId: OTHER,
      }).ok,
      true,
    )
  })
})

describe("canDeleteScheduleBlock", () => {
  it("allows doctor to remove own block", () => {
    assert.equal(
      canDeleteScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        blockProfessionalId: OWN,
      }).ok,
      true,
    )
  })

  it("denies doctor removing another professional block", () => {
    assert.equal(
      canDeleteScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        blockProfessionalId: OTHER,
      }).ok,
      false,
    )
  })

  it("denies doctor removing clinic-wide block", () => {
    assert.equal(
      canDeleteScheduleBlock({
        roleKey: "clinician",
        ownProfessionalId: OWN,
        blockProfessionalId: null,
      }).ok,
      false,
    )
  })

  it("allows receptionist to remove clinic-wide and any block", () => {
    assert.equal(
      canDeleteScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        blockProfessionalId: null,
      }).ok,
      true,
    )
    assert.equal(
      canDeleteScheduleBlock({
        roleKey: "receptionist",
        ownProfessionalId: null,
        blockProfessionalId: OTHER,
      }).ok,
      true,
    )
  })
})
