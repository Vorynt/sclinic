import { describe, expect, it } from "@jest/globals"
import { HouseIcon } from "@phosphor-icons/react"

import { routes } from "@/config/routes"
import type { ShellNav } from "@/modules/dashboard/constants/nav"
import { PRODUCT_TOUR_TARGET } from "@/modules/help/constants/product-tour"
import { buildOverflowDescription } from "@/modules/help/constants/product-tour"
import { filterProductTourSteps } from "@/modules/help/utils/filter-product-tour-steps"

const stubItem = (title: string, href: string) => ({
  title,
  href,
  icon: HouseIcon,
  enabled: true,
})

describe("buildOverflowDescription", () => {
  it("lists a single destination", () => {
    expect(buildOverflowDescription(["Ajuda"])).toBe(
      "Em Mais você encontra Ajuda.",
    )
  })

  it("joins two destinations with e", () => {
    expect(buildOverflowDescription(["Configurações", "Ajuda"])).toBe(
      "Em Mais você encontra Configurações e Ajuda.",
    )
  })

  it("joins three or more with commas and e", () => {
    expect(
      buildOverflowDescription(["Profissionais", "Equipe", "Faturamento"]),
    ).toBe("Em Mais você encontra Profissionais, Equipe e Faturamento.")
  })
})

describe("filterProductTourSteps", () => {
  it("keeps home, clinic and account for a nav with only Início", () => {
    const nav: ShellNav = {
      primary: [stubItem("Início", routes.home)],
      groups: [],
      secondary: [],
    }
    const ids = filterProductTourSteps(nav).map((step) => step.id)
    expect(ids).toEqual([
      PRODUCT_TOUR_TARGET.home,
      PRODUCT_TOUR_TARGET.clinic,
      PRODUCT_TOUR_TARGET.account,
    ])
  })

  it("includes appointments and patients when they are in primary nav", () => {
    const nav: ShellNav = {
      primary: [
        stubItem("Início", routes.home),
        stubItem("Agendamentos", routes.appointments),
        stubItem("Pacientes", routes.patients),
      ],
      groups: [],
      secondary: [],
    }
    const ids = filterProductTourSteps(nav).map((step) => step.id)
    expect(ids).toContain(PRODUCT_TOUR_TARGET.appointments)
    expect(ids).toContain(PRODUCT_TOUR_TARGET.patients)
    expect(ids).not.toContain(PRODUCT_TOUR_TARGET.overflow)
  })

  it("includes overflow with labels from groups and secondary", () => {
    const nav: ShellNav = {
      primary: [stubItem("Início", routes.home)],
      groups: [
        {
          id: "management",
          label: "Gestão",
          items: [stubItem("Profissionais", routes.professionals)],
        },
      ],
      secondary: [stubItem("Ajuda", routes.help)],
    }
    const steps = filterProductTourSteps(nav)
    const overflow = steps.find((step) => step.id === PRODUCT_TOUR_TARGET.overflow)
    expect(overflow?.description).toBe(
      "Em Mais você encontra Profissionais e Ajuda.",
    )
  })
})
