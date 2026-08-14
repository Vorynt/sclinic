import { describe, expect, it } from "@jest/globals"

import type { PageAction } from "@/types/page-action"
import { resolvePageActions } from "@/utils/resolve-page-actions"

const noop = () => undefined

function action(
  id: string,
  priority?: PageAction["priority"],
): PageAction {
  return { id, label: id, onClick: noop, priority }
}

describe("resolvePageActions", () => {
  it("returns empty when there are no actions", () => {
    expect(resolvePageActions([])).toEqual({
      primary: null,
      secondary: [],
    })
  })

  it("treats a single action as primary", () => {
    const only = action("new")
    expect(resolvePageActions([only])).toEqual({
      primary: only,
      secondary: [],
    })
  })

  it("defaults the last action to primary", () => {
    const block = action("block")
    const create = action("create")
    expect(resolvePageActions([block, create])).toEqual({
      primary: create,
      secondary: [block],
    })
  })

  it("honors explicit primary priority", () => {
    const create = action("create", "primary")
    const block = action("block", "secondary")
    expect(resolvePageActions([create, block])).toEqual({
      primary: create,
      secondary: [block],
    })
  })
})
