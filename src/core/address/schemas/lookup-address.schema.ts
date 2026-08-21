import { z } from "zod"

import { toZipDigits } from "@/core/address/zip"

export const lookupAddressSchema = z.object({
  zip: z
    .string()
    .trim()
    .transform(toZipDigits)
    .refine((value) => value.length === 8, { message: "CEP inválido" }),
})

export type LookupAddressInput = z.infer<typeof lookupAddressSchema>
