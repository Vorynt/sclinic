import { routes } from "@/config/routes"
import { NAV_TOUR_TARGET } from "@/modules/dashboard/constants/nav"

export const PRODUCT_TOUR_TARGET = NAV_TOUR_TARGET

export type ProductTourTarget =
  (typeof PRODUCT_TOUR_TARGET)[keyof typeof PRODUCT_TOUR_TARGET]

export type ProductTourStepDef = {
  id: ProductTourTarget
  title: string
  description: string
  /** Include only if this href is in the visible primary nav. */
  primaryHref?: string
  /** Include only when overflow (“Mais”) has destinations. */
  requiresOverflow?: boolean
}

export type ProductTourStep = {
  id: ProductTourTarget
  title: string
  description: string
}

export const PRODUCT_TOUR_STEPS: ProductTourStepDef[] = [
  {
    id: PRODUCT_TOUR_TARGET.home,
    title: "Início",
    description:
      "Aqui fica o resumo do dia: números, atalhos e o que precisa de atenção na clínica.",
    primaryHref: routes.home,
  },
  {
    id: PRODUCT_TOUR_TARGET.appointments,
    title: "Agendamentos",
    description:
      "A agenda da clínica: marcar, remarcar e acompanhar consultas.",
    primaryHref: routes.appointments,
  },
  {
    id: PRODUCT_TOUR_TARGET.patients,
    title: "Pacientes",
    description:
      "Cadastro e ficha de quem a clínica atende — histórico, consultas e documentos.",
    primaryHref: routes.patients,
  },
  {
    id: PRODUCT_TOUR_TARGET.overflow,
    title: "Mais",
    description: "Em Mais ficam as outras telas do sistema.",
    requiresOverflow: true,
  },
  {
    id: PRODUCT_TOUR_TARGET.clinic,
    title: "Clínica atual",
    description:
      "O nome no topo mostra em qual clínica você está. Se você participa de mais de uma, toque aqui para trocar.",
  },
  {
    id: PRODUCT_TOUR_TARGET.account,
    title: "Sua conta",
    description:
      "Aqui você abre Minha conta (dados, segurança e plano), troca o tema ou sai do sistema.",
  },
]

export function buildOverflowDescription(labels: string[]): string {
  if (labels.length === 0) {
    return "Em Mais ficam as outras telas do sistema."
  }
  if (labels.length === 1) {
    return `Em Mais você encontra ${labels[0]}.`
  }
  const head = labels.slice(0, -1).join(", ")
  const last = labels[labels.length - 1]
  return `Em Mais você encontra ${head} e ${last}.`
}
