import { mapHttpError } from "@/shared/api/map-http-error"

type ApiClientOptions = RequestInit & {
  parseJson?: boolean
}

/**
 * Shared HTTP client — never call fetch loosely from modules.
 * Throws AppError on non-OK responses (mapHttpError).
 * Prefer Server Actions for app mutations; use this for interactive client fetches.
 */
export async function apiClient<T>(
  input: RequestInfo | URL,
  options: ApiClientOptions = {},
): Promise<T> {
  const { parseJson = true, headers, ...init } = options

  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  })

  if (!response.ok) {
    await mapHttpError(response)
  }

  if (!parseJson || response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
