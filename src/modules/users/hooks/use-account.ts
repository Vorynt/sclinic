"use client"

import { useQuery } from "@tanstack/react-query"

import { accountQueries } from "@/modules/users/queries/account.query"

export function useAccountOverview() {
  return useQuery(accountQueries.overview())
}

export function useAccountProfile() {
  return useQuery(accountQueries.profile())
}
