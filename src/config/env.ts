/**
 * Validação e tipagem de variáveis de ambiente — Fase de infraestrutura.
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV,
} as const
