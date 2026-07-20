/**
 * Mutations React Query — implementação na Fase de infraestrutura.
 */
export const patientsMutationKeys = {
  create: ["patients", "create"] as const,
  update: ["patients", "update"] as const,
  delete: ["patients", "delete"] as const,
}
