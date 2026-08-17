import type { ShellNav } from "@/modules/dashboard/constants/nav"
import {
  buildOverflowDescription,
  PRODUCT_TOUR_STEPS,
  type ProductTourStep,
} from "@/modules/help/constants/product-tour"

function overflowLabels(nav: ShellNav): string[] {
  return [
    ...nav.groups.flatMap((group) => group.items.map((item) => item.title)),
    ...nav.secondary.map((item) => item.title),
  ]
}

/** Keeps tour steps that match the chrome the user can actually see. */
export function filterProductTourSteps(nav: ShellNav): ProductTourStep[] {
  const primaryHrefs = new Set(nav.primary.map((item) => item.href))
  const labels = overflowLabels(nav)
  const hasOverflow = labels.length > 0

  return PRODUCT_TOUR_STEPS.flatMap((step) => {
    if (step.primaryHref && !primaryHrefs.has(step.primaryHref)) {
      return []
    }
    if (step.requiresOverflow && !hasOverflow) {
      return []
    }

    return [
      {
        id: step.id,
        title: step.title,
        description: step.requiresOverflow
          ? buildOverflowDescription(labels)
          : step.description,
      },
    ]
  })
}
