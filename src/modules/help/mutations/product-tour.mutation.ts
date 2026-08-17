import { mutationOptions } from "@tanstack/react-query"

import { completeProductTourAction } from "@/modules/help/actions/complete-product-tour"
import { unwrapActionResult } from "@/shared/errors"

export const helpMutationKeys = {
  completeProductTour: ["help", "complete-product-tour"] as const,
}

export const helpMutations = {
  completeProductTour: () =>
    mutationOptions({
      mutationKey: helpMutationKeys.completeProductTour,
      mutationFn: async () =>
        unwrapActionResult(await completeProductTourAction()),
    }),
}
