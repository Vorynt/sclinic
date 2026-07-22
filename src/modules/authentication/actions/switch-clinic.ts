"use server";

import { switchClinicSchema } from "@/modules/authentication/schemas/auth.schema";
import { authService } from "@/modules/authentication/services/auth.service";
import type { AuthContext } from "@/modules/authentication/types/auth";
import { getAuthRequestContext } from "@/modules/authentication/utils/request-context";
import { toActionResult } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validators";
import type { ApiResponse } from "@/types/api";

export async function switchClinicAction(
  data: unknown,
): Promise<ApiResponse<AuthContext>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(switchClinicSchema, data);
    return authService.switchClinic(parsed, await getAuthRequestContext());
  });
}
