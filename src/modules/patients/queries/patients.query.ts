import { queryOptions } from "@tanstack/react-query"

import { getPatientAction } from "@/modules/patients/actions/get-patient"
import { listPatientsAction } from "@/modules/patients/actions/list-patients"
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
  list: (filters?: { q?: string }) =>
    queryOptions({
      queryKey: patientsQueryKeys.list(filters),
      queryFn: async () =>
        unwrapActionResult(await listPatientsAction(filters)),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: patientsQueryKeys.detail(id),
      queryFn: async () => unwrapActionResult(await getPatientAction(id)),
    }),
}
