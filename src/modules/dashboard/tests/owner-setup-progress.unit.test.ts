import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveOwnerSetupProgress } from "@/modules/dashboard/utils/owner-setup-progress"

describe("resolveOwnerSetupProgress", () => {
  it("marks unlock missions incomplete and locks appointment", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: false,
      hasService: false,
      hasPatient: false,
      hasAppointment: false,
    })

    assert.equal(progress.canSchedule, false)
    assert.equal(progress.allComplete, false)
    assert.equal(progress.completedCount, 0)
    assert.equal(progress.percent, 0)

    const appointment = progress.missions.find((m) => m.id === "appointment")
    assert.equal(appointment?.locked, true)
    assert.equal(appointment?.completed, false)

    for (const id of ["professional", "service", "patient"] as const) {
      const mission = progress.missions.find((m) => m.id === id)
      assert.equal(mission?.locked, false)
      assert.equal(mission?.unlocksScheduling, true)
    }
  })

  it("unlocks appointment when prerequisites are met", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: true,
      hasService: true,
      hasPatient: true,
      hasAppointment: false,
    })

    assert.equal(progress.canSchedule, true)
    assert.equal(progress.completedCount, 3)
    assert.equal(progress.percent, 75)
    assert.equal(progress.allComplete, false)

    const appointment = progress.missions.find((m) => m.id === "appointment")
    assert.equal(appointment?.locked, false)
    assert.equal(appointment?.completed, false)
  })

  it("hides roadmap when everything is complete", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: true,
      hasService: true,
      hasPatient: true,
      hasAppointment: true,
    })

    assert.equal(progress.canSchedule, true)
    assert.equal(progress.allComplete, true)
    assert.equal(progress.completedCount, 4)
    assert.equal(progress.percent, 100)
    assert.ok(progress.missions.every((m) => m.completed && !m.locked))
  })

  it("does not lock a completed appointment even if prerequisites regress", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: false,
      hasService: false,
      hasPatient: false,
      hasAppointment: true,
    })

    const appointment = progress.missions.find((m) => m.id === "appointment")
    assert.equal(appointment?.completed, true)
    assert.equal(appointment?.locked, false)
    assert.equal(progress.allComplete, false)
  })

  it("does not unlock appointment with partial prerequisites", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: true,
      hasService: true,
      hasPatient: false,
      hasAppointment: false,
    })

    assert.equal(progress.canSchedule, false)
    assert.equal(
      progress.missions.find((m) => m.id === "appointment")?.locked,
      true,
    )
  })
})
