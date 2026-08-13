import assert from "node:assert/strict"
import { describe, it } from "node:test"

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
    assert.deepEqual(resolvePageActions([]), {
      primary: null,
      secondary: [],
    })
  })

  it("treats a single action as primary", () => {
    const only = action("new")
    assert.deepEqual(resolvePageActions([only]), {
      primary: only,
      secondary: [],
    })
  })

  it("defaults the last action to primary", () => {
    const block = action("block")
    const create = action("create")
    assert.deepEqual(resolvePageActions([block, create]), {
      primary: create,
      secondary: [block],
    })
  })

  it("honors explicit primary priority", () => {
    const create = action("create", "primary")
    const block = action("block", "secondary")
    assert.deepEqual(resolvePageActions([create, block]), {
      primary: create,
      secondary: [block],
    })
  })
})
