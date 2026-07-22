import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações · sclinic",
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        Configurações
      </h1>
      <p className="text-sm text-muted-foreground">
        Em breve você poderá gerenciar preferências da conta e da clínica aqui.
      </p>
    </div>
  )
}
