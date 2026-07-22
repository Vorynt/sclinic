import {
  ASSIGNABLE_ROLE_KEYS,
  type AssignableRoleKey,
  USERS_CONSTANTS,
} from "@/modules/users/constants/users"
import { AppError, ErrorCode } from "@/shared/errors"

export function isAssignableRoleKey(key: string): key is AssignableRoleKey {
  return (ASSIGNABLE_ROLE_KEYS as readonly string[]).includes(key)
}

export function assertAssignableRoleKey(key: string): AssignableRoleKey {
  if (!isAssignableRoleKey(key)) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      message: "Este papel não pode ser atribuído por convite.",
    })
  }
  return key
}

export function assertCanManageMember(params: {
  actorUserId: string
  targetUserId: string
  targetRoleKey: string
}): void {
  if (params.targetRoleKey === USERS_CONSTANTS.OWNER_ROLE_KEY) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      message: "O proprietário da clínica não pode ser alterado por aqui.",
    })
  }

  if (params.actorUserId === params.targetUserId) {
    throw new AppError(ErrorCode.FORBIDDEN, {
      message: "Você não pode alterar o próprio acesso.",
    })
  }
}
