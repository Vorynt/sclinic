import { useQuery } from "@tanstack/react-query"

import { clinicsQueries } from "@/modules/clinics/queries/clinics.query"

export function useClinic(clinicId: string | null | undefined) {
  return useQuery({
    ...clinicsQueries.detail(clinicId ?? ""),
    enabled: Boolean(clinicId),
  })
}

export function useClinicsByIds(clinicIds: string[]) {
  return useQuery({
    ...clinicsQueries.byIds(clinicIds),
    enabled: clinicIds.length > 0,
  })
}
