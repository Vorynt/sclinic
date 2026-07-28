import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { HELP_FAQ } from "@/modules/help/constants/faq"
import {
  countFaqByCategory,
  filterHelpFaq,
  isHelpCategoryId,
} from "@/modules/help/utils/search-faq"

describe("help FAQ search", () => {
  it("filters by category", () => {
    const result = filterHelpFaq(HELP_FAQ, { categoryId: "patients" })
    assert.ok(result.length > 0)
    assert.ok(result.every((item) => item.categoryId === "patients"))
  })

    it("filters by accent-insensitive query", () => {
    const withAccent = filterHelpFaq(HELP_FAQ, { query: "receita" })
    const withoutAccent = filterHelpFaq(HELP_FAQ, { query: "RECEITA" })
    assert.ok(withAccent.length > 0)
    assert.equal(withAccent.length, withoutAccent.length)
    assert.ok(
      withAccent.some((item) => item.id === "prescriptions"),
      "expected prescriptions article in receita search",
    )
  })

  it("combines category and query", () => {
    const result = filterHelpFaq(HELP_FAQ, {
      categoryId: "billing",
      query: "plano",
    })
    assert.ok(result.some((item) => item.id === "saas-vs-clinical-billing"))
    assert.ok(result.every((item) => item.categoryId === "billing"))
  })

  it("returns empty list when nothing matches", () => {
    const result = filterHelpFaq(HELP_FAQ, {
      query: "xyzzy-no-match-123",
    })
    assert.equal(result.length, 0)
  })

  it("validates category ids", () => {
    assert.equal(isHelpCategoryId("appointments"), true)
    assert.equal(isHelpCategoryId("unknown"), false)
  })

  it("counts articles per category", () => {
    const counts = countFaqByCategory(HELP_FAQ)
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    assert.equal(total, HELP_FAQ.length)
    assert.ok(counts["getting-started"] >= 1)
  })

  it("keeps unique faq ids", () => {
    const ids = HELP_FAQ.map((item) => item.id)
    assert.equal(ids.length, new Set(ids).size)
  })
})
