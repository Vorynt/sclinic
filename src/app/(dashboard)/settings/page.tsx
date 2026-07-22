import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações · sclinic",
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Em breve você poderá gerenciar preferências da conta e da clínica aqui.
      </p>
    </div>
  )
}
