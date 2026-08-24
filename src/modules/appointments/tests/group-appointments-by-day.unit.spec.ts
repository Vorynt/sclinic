import { describe, expect, it } from "@jest/globals"

import type { Appointment } from "@/modules/appointments/types/appointment"
import { groupAppointmentsByDay } from "@/modules/appointments/utils/group-appointments-by-day"

function appointment({
  startsAt,
  endsAt,
  ...rest
}: Partial<Appointment> & { startsAt: Date }): Appointment {
  return {
    id: "a1",
    clinicId: "c1",
    patientId: "p1",
    patientName: "Ana",
    professionalId: null,
    professionalName: null,
    serviceId: null,
    serviceName: null,
    type: "consultation",
    modality: "in_person",
    status: "scheduled",
    reason: null,
    notes: null,
    canceledAt: null,
    canceledReason: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...rest,
    startsAt,
    endsAt: endsAt ?? new Date(startsAt.getTime() + 30 * 60_000),
  }
}

describe("groupAppointmentsByDay", () => {
  it("groups and sorts appointments by local day", () => {
    const later = appointment({
      id: "later",
      startsAt: new Date(2026, 7, 24, 14, 0),
    })
    const earlier = appointment({
      id: "earlier",
      startsAt: new Date(2026, 7, 24, 9, 0),
    })
    const nextDay = appointment({
      id: "next",
      startsAt: new Date(2026, 7, 25, 9, 0),
    })

    const grouped = groupAppointmentsByDay([later, nextDay, earlier])

    expect(grouped.get("2026-08-24")?.map((item) => item.id)).toEqual([
      "earlier",
      "later",
    ])
    expect(grouped.get("2026-08-25")?.map((item) => item.id)).toEqual(["next"])
  })
})
