/**
 * Template de módulo — esqueletos sem regra de negócio.
 * Fluxo: Action → Service → Repository → Database
 */

export type Patient = {
  id: string
  name: string
  cpf: string
  createdAt: Date
  updatedAt: Date
}
