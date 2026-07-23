import type { Metadata } from "next"

import { NotFoundBlock } from "@/components/status/NotFoundBlock"

export const metadata: Metadata = {
  title: "Página não encontrada · sclinic",
  description: "O endereço solicitado não existe ou foi movido.",
}

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <NotFoundBlock />
    </div>
  )
}
