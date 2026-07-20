/**
 * Factory React Query — implementação na Fase de infraestrutura.
 */
export const patientsQueryKeys = {
  all: ["patients"] as const,
  detail: (id: string) => ["patients", id] as const,
}
