import type { Metadata } from "next"

import { LandingPage } from "@/modules/marketing/components/LandingPage"

export const metadata: Metadata = {
  title: {
    absolute: "sclinic — Gestão clínica completa para consultórios",
  },
  description:
    "Agenda multi-profissional, pacientes, atendimento clínico e faturamento em um só lugar. Comece o teste grátis e organize sua clínica no mesmo dia.",
}

export default function MarketingHomePage() {
  return <LandingPage />
}
