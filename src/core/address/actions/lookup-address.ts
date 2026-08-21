"use server"

import { address } from "@/core/address"
import { lookupAddressSchema } from "@/core/address/schemas/lookup-address.schema"
import type { PostalAddress } from "@/core/address/types"
import { getSession } from "@/core/auth"
import { AppError, ErrorCode, toActionResult } from "@/shared/errors"
import { parseOrThrow } from "@/shared/validators"
import type { ApiResponse } from "@/types/api"

export async function lookupAddressAction(
  data: unknown,
): Promise<ApiResponse<PostalAddress>> {
  return toActionResult(async () => {
    const session = await getSession()
    if (!session?.user) {
      throw new AppError(ErrorCode.UNAUTHORIZED)
    }

    const parsed = parseOrThrow(lookupAddressSchema, data)
    return address.lookupByZip(parsed.zip)
  })
}
