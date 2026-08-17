import { describe, expect, it } from "@jest/globals"

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
    expect(result.length > 0).toBeTruthy()
    expect(result.every((item) => item.categoryId === "patients")).toBeTruthy()
  })

  it("filters by accent-insensitive query", () => {
    const withAccent = filterHelpFaq(HELP_FAQ, { query: "receita" })
    const withoutAccent = filterHelpFaq(HELP_FAQ, { query: "RECEITA" })
    expect(withAccent.length > 0).toBeTruthy()
    expect(withAccent.length).toBe(withoutAccent.length)
    expect(withAccent.some((item) => item.id === "prescriptions")).toBeTruthy()
  })

  it("combines category and query", () => {
    const result = filterHelpFaq(HELP_FAQ, {
      categoryId: "billing",
      query: "plano",
    })
    expect(result.some((item) => item.id === "saas-vs-clinical-billing")).toBeTruthy()
    expect(result.every((item) => item.categoryId === "billing")).toBeTruthy()
  })

  it("returns empty list when nothing matches", () => {
    const result = filterHelpFaq(HELP_FAQ, {
      query: "xyzzy-no-match-123",
    })
    expect(result.length).toBe(0)
  })

  it("validates category ids", () => {
    expect(isHelpCategoryId("appointments")).toBe(true)
    expect(isHelpCategoryId("unknown")).toBe(false)
  })

  it("counts articles per category", () => {
    const counts = countFaqByCategory(HELP_FAQ)
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    expect(total).toBe(HELP_FAQ.length)
    expect(counts["getting-started"] >= 1).toBeTruthy()
  })

  it("keeps unique faq ids for owner", () => {
    const ids = HELP_FAQ.map((item) => item.id)
    expect(ids.length).toBe(new Set(ids).size)
  })
})

describe("help FAQ by role", () => {
  it("exposes all clinic roles", () => {
    expect([...HELP_ROLE_KEYS].sort()).toEqual([
      "admin",
      "clinician",
      "financial",
      "manager",
      "nurse",
      "owner",
      "receptionist",
    ])
  })

  it("returns role-specific content", () => {
    const reception = getHelpFaqForRole("receptionist")
    const clinician = getHelpFaqForRole("clinician")
    expect(reception.some((item) => item.id === "board-columns")).toBeTruthy()
    expect(clinician.some((item) => item.id === "start-attendance")).toBeTruthy()
    expect(!reception.some((item) => item.id === "start-attendance")).toBeTruthy()
  })

  it("falls back to owner for unknown role", () => {
    expect(getHelpFaqForRole("unknown")).toBe(HELP_FAQ_BY_ROLE.owner)
    expect(getHelpFaqForRole(null)).toBe(HELP_FAQ_BY_ROLE.owner)
  })

  it("keeps unique ids within every role FAQ", () => {
    for (const role of HELP_ROLE_KEYS) {
      const items = HELP_FAQ_BY_ROLE[role]
      const ids = items.map((item) => item.id)
      expect(ids.length).toBe(new Set(ids).size)
      expect(items.length >= 8).toBeTruthy()
    }
  })

  it("includes the product tour article for every role", () => {
    for (const role of HELP_ROLE_KEYS) {
      expect(
        HELP_FAQ_BY_ROLE[role].some((item) => item.id === "product-tour"),
      ).toBeTruthy()
    }
  })

  it("receptionist FAQ covers counter payment without clinical write focus", () => {
    const items = getHelpFaqForRole("receptionist")
    expect(items.some((item) => item.id === "collect-payment")).toBeTruthy()
    expect(items.some((item) => item.id === "cannot-start-attendance")).toBeTruthy()
    expect(!items.some((item) => item.categoryId === "subscription")).toBeTruthy()
  })

  it("financial FAQ focuses on clinical billing", () => {
    const items = getHelpFaqForRole("financial")
    expect(items.some((item) => item.id === "billing-list")).toBeTruthy()
    expect(items.some((item) => item.id === "saas-vs-clinical")).toBeTruthy()
    expect(items.every((item) => item.categoryId !== "records")).toBeTruthy()
  })
})
