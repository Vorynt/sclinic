"use client"

import { useQuery } from "@tanstack/react-query"

import { patientsQueries } from "@/modules/patients/queries/patients.query"

export function usePatientsQuery(filters?: { q?: string }) {
  return useQuery(patientsQueries.list(filters))
}
