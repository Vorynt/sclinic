import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { classifyReceptionBoardColumn } from "@/modules/dashboard/utils/reception-board"

describe("classifyReceptionBoardColumn", () => {
  it("puts scheduled/confirmed in upcoming", () => {
    assert.equal(
      classifyReceptionBoardColumn({ status: "scheduled" }, null),
      "upcoming",
    )
    assert.equal(
      classifyReceptionBoardColumn({ status: "confirmed" }, null),
      "upcoming",
    )
  })

  it("puts checked_in in in_progress", () => {
    assert.equal(
      classifyReceptionBoardColumn(
        { status: "checked_in" },
        { status: "pending" },
      ),
      "in_progress",
    )
  })

  it("puts completed + pending charge in awaiting_payment", () => {
    assert.equal(
      classifyReceptionBoardColumn(
        { status: "completed" },
        { status: "pending" },
      ),
      "awaiting_payment",
    )
  })

  it("hides completed without pending charge", () => {
    assert.equal(
      classifyReceptionBoardColumn(
        { status: "completed" },
        { status: "paid" },
      ),
      null,
    )
    assert.equal(
      classifyReceptionBoardColumn({ status: "completed" }, null),
      null,
    )
  })

  it("hides canceled and no_show", () => {
    assert.equal(
      classifyReceptionBoardColumn({ status: "canceled" }, null),
      null,
    )
    assert.equal(
      classifyReceptionBoardColumn({ status: "no_show" }, null),
      null,
    )
  })
})
