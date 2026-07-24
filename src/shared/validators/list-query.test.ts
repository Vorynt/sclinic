import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_LIST_PAGE_SIZE,
  listQuerySchema,
} from "@/shared/validators"
import { getPageCount } from "@/types/pagination"

describe("listQuerySchema", () => {
  it("applies default page and pageSize", () => {
    const parsed = listQuerySchema.parse({})
    assert.equal(parsed.page, 1)
    assert.equal(parsed.pageSize, DEFAULT_LIST_PAGE_SIZE)
    assert.equal(parsed.q, undefined)
  })

  it("keeps optional sort fields unset by default", () => {
    const parsed = listQuerySchema.parse({})
    assert.equal(parsed.sortBy, undefined)
    assert.equal(parsed.sortDir, undefined)
  })

  it("rejects pageSize above the max", () => {
    assert.throws(() => listQuerySchema.parse({ pageSize: 101 }))
  })
})

describe("getPageCount", () => {
  it("rounds up partial pages", () => {
    assert.equal(getPageCount(41, 20), 3)
    assert.equal(getPageCount(0, 20), 0)
    assert.equal(getPageCount(20, 20), 1)
  })
})
