import { HELP_CATEGORIES } from "@/modules/help/constants/categories"
import type { HelpCategoryId, HelpFaqItem } from "@/modules/help/types/help"

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

function itemSearchBlob(item: HelpFaqItem): string {
  return normalize(
    [
      item.question,
      ...item.answer,
      ...(item.steps ?? []),
      ...item.keywords,
      item.id,
    ].join(" "),
  )
}

export function isHelpCategoryId(value: string): value is HelpCategoryId {
  return HELP_CATEGORIES.some((category) => category.id === value)
}

export function filterHelpFaq(
  items: readonly HelpFaqItem[],
  options: {
    query?: string
    categoryId?: HelpCategoryId | "all"
  },
): HelpFaqItem[] {
  const categoryId = options.categoryId ?? "all"
  const query = normalize(options.query ?? "")

  return items.filter((item) => {
    if (categoryId !== "all" && item.categoryId !== categoryId) {
      return false
    }
    if (!query) return true
    return itemSearchBlob(item).includes(query)
  })
}

export function countFaqByCategory(
  items: readonly HelpFaqItem[],
): Record<HelpCategoryId, number> {
  const counts = Object.fromEntries(
    HELP_CATEGORIES.map((category) => [category.id, 0]),
  ) as Record<HelpCategoryId, number>

  for (const item of items) {
    counts[item.categoryId] += 1
  }

  return counts
}
