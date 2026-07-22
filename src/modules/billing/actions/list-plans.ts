"use server";

import { billingService } from "@/modules/billing/services/billing.service";
import type { Plan } from "@/modules/billing/types/billing";
import { toActionResult } from "@/shared/errors";
import type { ApiResponse } from "@/types/api";

export async function listPlansAction(): Promise<ApiResponse<Plan[]>> {
  return toActionResult(async () => billingService.listActivePlans());
}
