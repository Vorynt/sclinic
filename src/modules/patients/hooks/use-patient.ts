"use client"

import { useQuery } from "@tanstack/react-query"

import { patientsQueries } from "@/modules/patients/queries/patients.query"

export function usePatient(id: string) {
  return useQuery({
    ...patientsQueries.detail(id),
    enabled: Boolean(id),
  })
}
