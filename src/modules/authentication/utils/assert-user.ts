import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"
import type { AuthUser } from "@/modules/authentication/types/auth"

/**
 * Ensures the user account is allowed to authenticate.
 */
export function assertUserCanAuthenticate(user: AuthUser): void {
  if (user.status === "suspended") {
    throw new AppError(ErrorCode.USER_SUSPENDED)
  }
  if (user.status === "inactive") {
    throw new AppError(ErrorCode.USER_INACTIVE)
  }
}
