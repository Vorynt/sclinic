import type { Metadata } from "next"

import { HomeByRole } from "@/modules/dashboard/components/home/HomeByRole"

export const metadata: Metadata = {
  title: "Início · sclinic",
}

export default function HomePage() {
  return <HomeByRole />
}
