"use client"

import { useQuery } from "@tanstack/react-query"

import { clinicsQueries } from "@/modules/clinics/queries/clinics.query"

export function useActiveClinicForSettings() {
  return useQuery(clinicsQueries.activeForSettings())
}

export function useClinicHours() {
  return useQuery(clinicsQueries.hours())
}
