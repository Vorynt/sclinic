import { mapViaCepResponse } from "@/core/address/map-viacep"
import type {
  AddressLookupProvider,
  PostalAddress,
} from "@/core/address/types"
import { toZipDigits } from "@/core/address/zip"
import { apiClient } from "@/shared/api/client"
import { AppError, ErrorCode, getClientMessage, isAppError } from "@/shared/errors"

const VIA_CEP_TIMEOUT_MS = 5_000

function lookupFailed(cause?: unknown): never {
  throw new AppError(ErrorCode.ADDRESS_LOOKUP_FAILED, {
    message: getClientMessage(ErrorCode.ADDRESS_LOOKUP_FAILED),
    cause,
  })
}

/**
 * ViaCEP implementation of AddressLookupProvider.
 * Do not import this from outside `core/address` — use `address` from `@/core/address`.
 */
export class ViaCepAddressLookupProvider implements AddressLookupProvider {
  async lookupByZip(zip: string): Promise<PostalAddress> {
    const digits = toZipDigits(zip)
    if (digits.length !== 8) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        message: "CEP inválido",
      })
    }

    try {
      const payload = await apiClient<unknown>(
        `https://viacep.com.br/ws/${digits}/json/`,
        { signal: AbortSignal.timeout(VIA_CEP_TIMEOUT_MS) },
      )
      return mapViaCepResponse(payload)
    } catch (error) {
      if (isAppError(error) && error.code === ErrorCode.ADDRESS_NOT_FOUND) {
        throw error
      }
      lookupFailed(error)
    }
  }
}
