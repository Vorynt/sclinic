import { describe, expect, it } from "@jest/globals"

import { summarizeDayOps } from "@/modules/dashboard/utils/day-ops-stats"

describe("summarizeDayOps", () => {
  it("counts waiting, in progress and completed", () => {
    const stats = summarizeDayOps([
      { status: "scheduled" },
      { status: "confirmed" },
      { status: "checked_in" },
      { status: "completed" },
      { status: "completed" },
    ])

    expect(stats).toEqual({
      total: 5,
      waiting: 2,
      inProgress: 1,
      completed: 2,
    })
  })

  it("excludes canceled and no_show from totals", () => {
    const stats = summarizeDayOps([
      { status: "scheduled" },
      { status: "canceled" },
      { status: "no_show" },
      { status: "checked_in" },
    ])

    expect(stats).toEqual({
      total: 2,
      waiting: 1,
      inProgress: 1,
      completed: 0,
    })
  })

  it("returns zeros for empty list", () => {
    expect(summarizeDayOps([])).toEqual({
      total: 0,
      waiting: 0,
      inProgress: 0,
      completed: 0,
    })
  })
})
