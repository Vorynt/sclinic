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
  [ErrorCode.EMAIL_SEND_FAILED]: "Não foi possível enviar o e-mail. Tente novamente.",
  [ErrorCode.INVALID_CREDENTIALS]: "E-mail ou senha inválidos.",
  [ErrorCode.EMAIL_ALREADY_EXISTS]: "Já existe uma conta com este e-mail.",
  [ErrorCode.USER_INACTIVE]: "Sua conta está inativa. Contate o suporte.",
  [ErrorCode.USER_SUSPENDED]: "Sua conta está suspensa. Contate o suporte.",
  [ErrorCode.EMAIL_NOT_VERIFIED]: "Verifique seu e-mail antes de continuar.",
  [ErrorCode.SESSION_EXPIRED]: "Sua sessão expirou. Faça login novamente.",
  [ErrorCode.CLINIC_REQUIRED]:
    "Complete o cadastro da clínica para continuar.",
  [ErrorCode.MEMBERSHIP_NOT_FOUND]: "Você não pertence a esta clínica.",
  [ErrorCode.MEMBERSHIP_INACTIVE]: "Seu acesso a esta clínica está inativo.",
  [ErrorCode.INVALID_TOKEN]: "Token inválido.",
  [ErrorCode.TOKEN_EXPIRED]: "Token expirado. Solicite um novo.",
}

/**
 * Maps a stable error code to a client-facing message.
 * Domain modules can extend this map later (or via i18n).
 */
export function getClientMessage(code: string): string {
  return clientMessages[code] ?? clientMessages[ErrorCode.INTERNAL_ERROR]
}
