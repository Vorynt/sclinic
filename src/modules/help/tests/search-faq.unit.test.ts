import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  getHelpFaqForRole,
  HELP_FAQ,
  HELP_FAQ_BY_ROLE,
  HELP_ROLE_KEYS,
} from "@/modules/help/constants/faq"
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

  it("keeps unique faq ids for owner", () => {
    const ids = HELP_FAQ.map((item) => item.id)
    assert.equal(ids.length, new Set(ids).size)
  })
})

describe("help FAQ by role", () => {
  it("exposes all clinic roles", () => {
    assert.deepEqual([...HELP_ROLE_KEYS].sort(), [
      "admin",
      "doctor",
      "financial",
      "manager",
      "nurse",
      "owner",
      "receptionist",
    ])
  })

  it("returns role-specific content", () => {
    const reception = getHelpFaqForRole("receptionist")
    const doctor = getHelpFaqForRole("doctor")
    assert.ok(reception.some((item) => item.id === "board-columns"))
    assert.ok(doctor.some((item) => item.id === "start-attendance"))
    assert.ok(!reception.some((item) => item.id === "start-attendance"))
  })

  it("falls back to owner for unknown role", () => {
    assert.equal(getHelpFaqForRole("unknown"), HELP_FAQ_BY_ROLE.owner)
    assert.equal(getHelpFaqForRole(null), HELP_FAQ_BY_ROLE.owner)
  })

  it("keeps unique ids within every role FAQ", () => {
    for (const role of HELP_ROLE_KEYS) {
      const items = HELP_FAQ_BY_ROLE[role]
      const ids = items.map((item) => item.id)
      assert.equal(
        ids.length,
        new Set(ids).size,
        `duplicate FAQ ids in role ${role}`,
      )
      assert.ok(items.length >= 8, `role ${role} should have a solid FAQ set`)
    }
  })

  it("receptionist FAQ covers counter payment without clinical write focus", () => {
    const items = getHelpFaqForRole("receptionist")
    assert.ok(items.some((item) => item.id === "collect-payment"))
    assert.ok(items.some((item) => item.id === "cannot-start-attendance"))
    assert.ok(!items.some((item) => item.categoryId === "subscription"))
  })

  it("financial FAQ focuses on clinical billing", () => {
    const items = getHelpFaqForRole("financial")
    assert.ok(items.some((item) => item.id === "billing-list"))
    assert.ok(items.some((item) => item.id === "saas-vs-clinical"))
    assert.ok(items.every((item) => item.categoryId !== "records"))
  })
})
