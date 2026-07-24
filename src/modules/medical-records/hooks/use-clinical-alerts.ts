"use client"

import { useQuery } from "@tanstack/react-query"

import { clinicalAlertsQueries } from "@/modules/medical-records/queries/clinical-alerts.query"

export function useClinicalAlertsQuery(patientId: string) {
  return useQuery({
    ...clinicalAlertsQueries.list(patientId),
    enabled: Boolean(patientId),
  })
}
