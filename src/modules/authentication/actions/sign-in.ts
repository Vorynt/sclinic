"use server";

import { signInSchema } from "@/modules/authentication/schemas/auth.schema";
import { authService } from "@/modules/authentication/services/auth.service";
import type { SignInResult } from "@/modules/authentication/types/auth";
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context";
import { toActionResult } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validators";
import type { ApiResponse } from "@/types/api";

export async function signInAction(
  data: unknown,
): Promise<ApiResponse<SignInResult>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(signInSchema, data);
    return authService.signIn(parsed, await getAuthRequestContext());
  });
}
