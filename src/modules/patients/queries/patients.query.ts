import { queryOptions } from "@tanstack/react-query"

import { getPatientAction } from "@/modules/patients/actions/get-patient"
import { unwrapActionResult } from "@/shared/errors"

export const patientsQueryKeys = {
  all: ["patients"] as const,
  lists: () => [...patientsQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...patientsQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...patientsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...patientsQueryKeys.details(), id] as const,
}

export const patientsQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: patientsQueryKeys.detail(id),
      queryFn: async () => unwrapActionResult(await getPatientAction(id)),
    }),
}
