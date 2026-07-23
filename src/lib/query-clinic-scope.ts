/**
 * Active clinic id used by React Query's queryKeyHashFn to isolate
 * the client cache per clinic without changing individual query factories.
 *
 * Browser: module singleton. Server: each request already gets a fresh QueryClient.
 */
let activeClinicId: string | null = null

export function getQueryClinicId(): string | null {
  return activeClinicId
}

export function setQueryClinicId(clinicId: string | null): void {
  activeClinicId = clinicId
}
