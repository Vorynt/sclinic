import type { AppError } from "@/shared/errors/app-error"
import { ErrorCode } from "@/shared/errors/codes"

const clientMessages: Record<string, string> = {
  [ErrorCode.NOT_FOUND]: "Não encontramos o que você procura.",
  [ErrorCode.CONFLICT]: "Este registro já existe ou conflita com outro.",
  [ErrorCode.FORBIDDEN]: "Você não tem permissão para esta ação.",
  [ErrorCode.UNAUTHORIZED]: "Faça login para continuar.",
  [ErrorCode.VALIDATION_FAILED]: "Verifique os campos e tente novamente.",
  [ErrorCode.INTERNAL_ERROR]: "Algo deu errado. Tente novamente.",
  [ErrorCode.DB_CONNECTION_FAILED]: "Algo deu errado. Tente novamente.",
  [ErrorCode.DB_UNIQUE_VIOLATION]: "Este registro já existe ou conflita com outro.",
  [ErrorCode.DB_FOREIGN_KEY_VIOLATION]:
    "Não foi possível concluir. Há informações relacionadas que impedem esta ação.",
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
  [ErrorCode.SUBSCRIPTION_INACTIVE]:
    "A assinatura desta clínica está suspensa.",
  [ErrorCode.PLAN_LIMIT_EXCEEDED]:
    "Limite do plano atingido. Atualize o plano ou reduza o uso para continuar.",
  [ErrorCode.INVALID_TOKEN]: "Este link é inválido.",
  [ErrorCode.TOKEN_EXPIRED]: "Este link expirou. Solicite um novo.",
  [ErrorCode.PASSWORD_CHANGE_REQUIRED]:
    "Altere sua senha provisória para continuar.",
  [ErrorCode.INVITATION_NOT_FOUND]: "Convite não encontrado.",
  [ErrorCode.INVITATION_REVOKED]: "Este convite foi cancelado.",
  [ErrorCode.INVITATION_ALREADY_ACCEPTED]: "Este convite já foi aceito.",
  [ErrorCode.INVITE_EMAIL_MISMATCH]:
    "Faça login com o e-mail que recebeu o convite.",
  [ErrorCode.APPOINTMENT_SLOT_UNAVAILABLE]:
    "O profissional já possui um agendamento neste horário.",
  [ErrorCode.PROFESSIONAL_OUTSIDE_WORKING_HOURS]:
    "Horário fora do funcionamento da clínica.",
}

/**
 * Maps a stable error code to a client-facing message.
 * Domain modules can extend this map later (or via i18n).
 */
export function getClientMessage(code: string): string {
  return clientMessages[code] ?? clientMessages[ErrorCode.INTERNAL_ERROR]
}

/**
 * Prefers a client-safe message set by the service on AppError;
 * falls back to the code map when none was provided.
 */
export function resolveClientMessage(error: AppError): string {
  if (error.message && error.message !== error.code) {
    return error.message
  }
  return getClientMessage(error.code)
}
