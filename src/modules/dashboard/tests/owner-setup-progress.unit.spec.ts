import { describe, expect, it } from "@jest/globals"

import { resolveOwnerSetupProgress } from "@/modules/dashboard/utils/owner-setup-progress"

describe("resolveOwnerSetupProgress", () => {
  it("marks unlock missions incomplete and locks appointment", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: false,
      hasService: false,
      hasPatient: false,
      hasAppointment: false,
    })

    expect(progress.canSchedule).toBe(false)
    expect(progress.allComplete).toBe(false)
    expect(progress.completedCount).toBe(0)
    expect(progress.percent).toBe(0)

    const appointment = progress.missions.find((m) => m.id === "appointment")
    expect(appointment?.locked).toBe(true)
    expect(appointment?.completed).toBe(false)

    for (const id of ["professional", "service", "patient"] as const) {
      const mission = progress.missions.find((m) => m.id === id)
      expect(mission?.locked).toBe(false)
      expect(mission?.unlocksScheduling).toBe(true)
    }
  })

  it("unlocks appointment when prerequisites are met", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: true,
      hasService: true,
      hasPatient: true,
      hasAppointment: false,
    })

    expect(progress.canSchedule).toBe(true)
    expect(progress.completedCount).toBe(3)
    expect(progress.percent).toBe(75)
    expect(progress.allComplete).toBe(false)

    const appointment = progress.missions.find((m) => m.id === "appointment")
    expect(appointment?.locked).toBe(false)
    expect(appointment?.completed).toBe(false)
  })

  it("hides roadmap when everything is complete", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: true,
      hasService: true,
      hasPatient: true,
      hasAppointment: true,
    })

    expect(progress.canSchedule).toBe(true)
    expect(progress.allComplete).toBe(true)
    expect(progress.completedCount).toBe(4)
    expect(progress.percent).toBe(100)
    expect(progress.missions.every((m) => m.completed && !m.locked)).toBeTruthy()
  })

  it("does not lock a completed appointment even if prerequisites regress", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: false,
      hasService: false,
      hasPatient: false,
      hasAppointment: true,
    })

    const appointment = progress.missions.find((m) => m.id === "appointment")
    expect(appointment?.completed).toBe(true)
    expect(appointment?.locked).toBe(false)
    expect(progress.allComplete).toBe(false)
  })

  it("does not unlock appointment with partial prerequisites", () => {
    const progress = resolveOwnerSetupProgress({
      hasProfessional: true,
      hasService: true,
      hasPatient: false,
      hasAppointment: false,
    })

    expect(progress.canSchedule).toBe(false)
    expect(progress.missions.find((m) => m.id === "appointment")?.locked).toBe(true)
  })
})
