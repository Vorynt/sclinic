import { ErrorCode } from "@/shared/errors/codes"

const clientMessages: Record<string, string> = {
  [ErrorCode.NOT_FOUND]: "Recurso não encontrado.",
  [ErrorCode.CONFLICT]: "Este registro já existe ou conflita com outro.",
  [ErrorCode.FORBIDDEN]: "Você não tem permissão para esta ação.",
  [ErrorCode.UNAUTHORIZED]: "Faça login para continuar.",
  [ErrorCode.VALIDATION_FAILED]: "Verifique os campos e tente novamente.",
  [ErrorCode.INTERNAL_ERROR]: "Algo deu errado. Tente novamente.",
  [ErrorCode.DB_CONNECTION_FAILED]: "Algo deu errado. Tente novamente.",
  [ErrorCode.DB_UNIQUE_VIOLATION]: "Este registro já existe ou conflita com outro.",
  [ErrorCode.DB_FOREIGN_KEY_VIOLATION]: "Operação inválida por dependência de dados.",
  [ErrorCode.DB_NOT_NULL_VIOLATION]: "Verifique os campos e tente novamente.",
  [ErrorCode.DB_QUERY_FAILED]: "Algo deu errado. Tente novamente.",
}

/**
 * Maps a stable error code to a client-facing message.
 * Domain modules can extend this map later (or via i18n).
 */
export function getClientMessage(code: string): string {
  return clientMessages[code] ?? clientMessages[ErrorCode.INTERNAL_ERROR]
}
