import { queryOptions } from "@tanstack/react-query"

import { getAccountOverviewAction } from "@/modules/users/actions/get-account-overview"
import { getAccountProfileAction } from "@/modules/users/actions/get-account-profile"
import { unwrapActionResult } from "@/shared/errors"

export const accountQueryKeys = {
  all: ["account"] as const,
  overview: () => [...accountQueryKeys.all, "overview"] as const,
  profile: () => [...accountQueryKeys.all, "profile"] as const,
}

export const accountQueries = {
  overview: () =>
    queryOptions({
      queryKey: accountQueryKeys.overview(),
      queryFn: async () =>
        unwrapActionResult(await getAccountOverviewAction()),
    }),

  profile: () =>
    queryOptions({
      queryKey: accountQueryKeys.profile(),
      queryFn: async () =>
        unwrapActionResult(await getAccountProfileAction()),
    }),
}
