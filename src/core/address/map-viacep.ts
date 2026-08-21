import type { PostalAddress } from "@/core/address/types"
import { toZipDigits } from "@/core/address/zip"
import { AppError, ErrorCode, getClientMessage } from "@/shared/errors"

type ViaCepResponse = {
  erro?: boolean | string
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function isViaCepError(payload: ViaCepResponse): boolean {
  return payload.erro === true || payload.erro === "true"
}

/**
 * Maps a ViaCEP JSON payload to the domain PostalAddress.
 * Portuguese field names never leave this module.
 */
export function mapViaCepResponse(payload: unknown): PostalAddress {
  if (!isRecord(payload)) {
    throw new AppError(ErrorCode.ADDRESS_LOOKUP_FAILED, {
      message: getClientMessage(ErrorCode.ADDRESS_LOOKUP_FAILED),
    })
  }

  const raw = payload as ViaCepResponse

  if (isViaCepError(raw)) {
    throw new AppError(ErrorCode.ADDRESS_NOT_FOUND, {
      message: getClientMessage(ErrorCode.ADDRESS_NOT_FOUND),
    })
  }

  const city = asTrimmedString(raw.localidade)
  const state = asTrimmedString(raw.uf).toUpperCase()
  const zip = toZipDigits(asTrimmedString(raw.cep))

  if (!city || state.length !== 2 || zip.length !== 8) {
    throw new AppError(ErrorCode.ADDRESS_LOOKUP_FAILED, {
      message: getClientMessage(ErrorCode.ADDRESS_LOOKUP_FAILED),
    })
  }

  const neighborhood = asTrimmedString(raw.bairro)

  return {
    zip,
    street: asTrimmedString(raw.logradouro),
    neighborhood: neighborhood.length > 0 ? neighborhood : null,
    city,
    state,
  }
}
