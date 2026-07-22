import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard · sclinic",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
        Bem-vindo ao painel. Use a sidebar para navegar entre os módulos.
      </p>
    </div>
  )
}
