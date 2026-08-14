import { describe, expect, it } from "@jest/globals"

import { classifyReceptionBoardColumn, countReceptionBoardColumns } from "@/modules/dashboard/utils/reception-board"

describe("classifyReceptionBoardColumn", () => {
  it("puts scheduled/confirmed in upcoming", () => {
    expect(classifyReceptionBoardColumn({ status: "scheduled" }, null)).toBe("upcoming")
    expect(classifyReceptionBoardColumn({ status: "confirmed" }, null)).toBe("upcoming")
  })

  it("puts checked_in in in_progress", () => {
    expect(classifyReceptionBoardColumn(
        { status: "checked_in" },
        { status: "pending" },
      )).toBe("in_progress")
  })

  it("puts completed + pending charge in awaiting_payment", () => {
    expect(classifyReceptionBoardColumn(
        { status: "completed" },
        { status: "pending" },
      )).toBe("awaiting_payment")
  })

  it("hides completed without pending charge", () => {
    expect(classifyReceptionBoardColumn(
        { status: "completed" },
        { status: "paid" },
      )).toBe(null)
    expect(classifyReceptionBoardColumn({ status: "completed" }, null)).toBe(null)
  })

  it("hides canceled and no_show", () => {
    expect(classifyReceptionBoardColumn({ status: "canceled" }, null)).toBe(null)
    expect(classifyReceptionBoardColumn({ status: "no_show" }, null)).toBe(null)
  })
})

describe("countReceptionBoardColumns", () => {
  it("aggregates column counts", () => {
    expect(countReceptionBoardColumns([
        { appointment: { status: "scheduled" }, charge: null },
        { appointment: { status: "confirmed" }, charge: null },
        { appointment: { status: "checked_in" }, charge: null },
        {
          appointment: { status: "completed" },
          charge: { status: "pending" },
        },
        { appointment: { status: "canceled" }, charge: null },
      ])).toEqual({
        upcoming: 2,
        in_progress: 1,
        awaiting_payment: 1,
      })
  })
})
