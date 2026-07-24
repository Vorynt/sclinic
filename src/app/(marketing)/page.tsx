import type { Metadata } from "next"

import { LandingPage } from "@/modules/marketing/components/LandingPage"

export const metadata: Metadata = {
  title: {
    absolute: "sclinic — Software para clínicas e consultórios",
  },
  description:
    "Agenda multi-profissional, pacientes e atendimento clínico em um só lugar. Organize a operação da sua clínica com o sclinic.",
}

export default function MarketingHomePage() {
  return <LandingPage />
}
