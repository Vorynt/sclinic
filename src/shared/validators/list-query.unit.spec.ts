import { describe, expect, it } from "@jest/globals"

import {
  DEFAULT_LIST_PAGE_SIZE,
  listQuerySchema,
} from "@/shared/validators"
import { getPageCount } from "@/types/pagination"

describe("listQuerySchema", () => {
  it("applies default page and pageSize", () => {
    const parsed = listQuerySchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.pageSize).toBe(DEFAULT_LIST_PAGE_SIZE)
    expect(parsed.q).toBe(undefined)
  })

  it("keeps optional sort fields unset by default", () => {
    const parsed = listQuerySchema.parse({})
    expect(parsed.sortBy).toBe(undefined)
    expect(parsed.sortDir).toBe(undefined)
  })

  it("rejects pageSize above the max", () => {
    expect(() => listQuerySchema.parse({ pageSize: 101 })).toThrow()
  })
})

describe("getPageCount", () => {
  it("rounds up partial pages", () => {
    expect(getPageCount(41, 20)).toBe(3)
    expect(getPageCount(0, 20)).toBe(0)
    expect(getPageCount(20, 20)).toBe(1)
  })
})
