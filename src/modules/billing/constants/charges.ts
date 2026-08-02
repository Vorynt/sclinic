export const CHARGE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  canceled: "Cancelado",
  failed: "Falhou",
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  pix_manual: "PIX",
  card: "Cartão",
  transfer: "Transferência",
  other: "Outro",
  gateway: "Pagamento online",
  courtesy: "Cortesia",
}

export const BILLING_KIND_LABELS = {
  standard: "Padrão",
  courtesy: "Cortesia",
  return: "Retorno",
} as const
