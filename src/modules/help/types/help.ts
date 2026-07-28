export type HelpCategoryId =
  | "getting-started"
  | "clinic"
  | "team"
  | "patients"
  | "appointments"
  | "records"
  | "billing"
  | "subscription"
  | "account"

export type HelpRelatedRoute = {
  label: string
  href: string
}

export type HelpFaqItem = {
  id: string
  categoryId: HelpCategoryId
  question: string
  /** Paragraphs shown in the answer body. */
  answer: string[]
  /** Numbered how-to steps, when useful. */
  steps?: string[]
  /** Deep links into real app screens. */
  relatedRoutes?: HelpRelatedRoute[]
  /** Extra terms for client-side search. */
  keywords: string[]
}

export type HelpCategory = {
  id: HelpCategoryId
  label: string
  description: string
}
