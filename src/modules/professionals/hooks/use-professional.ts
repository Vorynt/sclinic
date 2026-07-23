"use client"

import { useQuery } from "@tanstack/react-query"

import { professionalsQueries } from "@/modules/professionals/queries/professionals.query"

export function useProfessional(id: string) {
  return useQuery({
    ...professionalsQueries.detail(id),
    enabled: Boolean(id),
  })
}

export function useProfessionalInvitePreview(token: string) {
  return useQuery({
    ...professionalsQueries.invitePreview(token),
    enabled: Boolean(token),
  })
}
