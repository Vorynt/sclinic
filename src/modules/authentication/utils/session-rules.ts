import { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

export function assertCanRevokeSession(
  currentSessionId: string,
  targetSessionId: string,
): void {
  if (currentSessionId === targetSessionId) {
    throw new AppError(ErrorCode.CANNOT_REVOKE_CURRENT_SESSION)
  }
}
