"use client"

import { useSearchParams } from "next/navigation"

import {
  buildPatientsListHref,
  patientsListLocationFromSearchParams,
} from "@/modules/patients/utils/patients-list-href"

/** Patients list href restored from `q`/`page` carried on the detail URL. */
export function usePatientsListReturnHref(): string {
  const searchParams = useSearchParams()
  return buildPatientsListHref(
    patientsListLocationFromSearchParams(searchParams),
  )
}
