import type { Metadata } from "next"

import { ForbiddenBlock } from "@/components/status/ForbiddenBlock"

export const metadata: Metadata = {
  title: "Acesso negado · sclinic",
  description: "Você não tem permissão para acessar esta página.",
}

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <ForbiddenBlock />
    </div>
  )
}
