import { describe, expect, it } from "@jest/globals"

import { mapViaCepResponse } from "@/core/address/map-viacep"
import { lookupAddressSchema } from "@/core/address/schemas/lookup-address.schema"
import { isCompleteZip, toZipDigits } from "@/core/address/zip"
import { ErrorCode, isAppError } from "@/shared/errors"

const VIA_CEP_SE = {
  cep: "01001-000",
  logradouro: "Praça da Sé",
  complemento: "lado ímpar",
  unidade: "",
  bairro: "Sé",
  localidade: "São Paulo",
  uf: "SP",
  estado: "São Paulo",
  regiao: "Sudeste",
  ibge: "3550308",
  gia: "1004",
  ddd: "11",
  siafi: "7107",
}

describe("toZipDigits", () => {
  it("strips the CEP mask", () => {
    expect(toZipDigits("01001-000")).toBe("01001000")
    expect(toZipDigits(" 01.001-000 ")).toBe("01001000")
  })
})

describe("isCompleteZip", () => {
  it("accepts 8 digits with or without mask", () => {
    expect(isCompleteZip("01001000")).toBe(true)
    expect(isCompleteZip("01001-000")).toBe(true)
  })

  it("rejects incomplete values", () => {
    expect(isCompleteZip("01001-00")).toBe(false)
    expect(isCompleteZip("")).toBe(false)
  })
})

describe("lookupAddressSchema", () => {
  it("accepts a masked CEP and returns digits", () => {
    expect(lookupAddressSchema.parse({ zip: "01001-000" })).toEqual({
      zip: "01001000",
    })
  })

  it("rejects an incomplete CEP", () => {
    const result = lookupAddressSchema.safeParse({ zip: "01001-00" })
    expect(result.success).toBe(false)
  })
})

describe("mapViaCepResponse", () => {
  it("maps Portuguese ViaCEP fields to the English PostalAddress", () => {
    expect(mapViaCepResponse(VIA_CEP_SE)).toEqual({
      zip: "01001000",
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    })
  })

  it("does not map ViaCEP complemento onto the domain address", () => {
    const mapped = mapViaCepResponse(VIA_CEP_SE)
    expect(mapped).not.toHaveProperty("complement")
    expect(mapped).not.toHaveProperty("complemento")
  })

  it("keeps empty street and neighborhood for a city-wide CEP", () => {
    expect(
      mapViaCepResponse({
        cep: "28999-000",
        logradouro: "",
        bairro: "",
        localidade: "Armação dos Búzios",
        uf: "rj",
      }),
    ).toEqual({
      zip: "28999000",
      street: "",
      neighborhood: null,
      city: "Armação dos Búzios",
      state: "RJ",
    })
  })

  it("throws ADDRESS_NOT_FOUND when ViaCEP reports erro", () => {
    try {
      mapViaCepResponse({ erro: true })
      throw new Error("expected AppError")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      if (isAppError(error)) {
        expect(error.code).toBe(ErrorCode.ADDRESS_NOT_FOUND)
      }
    }

    try {
      mapViaCepResponse({ erro: "true" })
      throw new Error("expected AppError")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      if (isAppError(error)) {
        expect(error.code).toBe(ErrorCode.ADDRESS_NOT_FOUND)
      }
    }
  })

  it("throws ADDRESS_LOOKUP_FAILED for a malformed payload", () => {
    try {
      mapViaCepResponse({ cep: "01001-000", localidade: "", uf: "" })
      throw new Error("expected AppError")
    } catch (error) {
      expect(isAppError(error)).toBe(true)
      if (isAppError(error)) {
        expect(error.code).toBe(ErrorCode.ADDRESS_LOOKUP_FAILED)
      }
    }
  })
})
