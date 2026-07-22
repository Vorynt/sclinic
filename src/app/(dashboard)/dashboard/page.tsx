import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard · sclinic",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background px-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
        Login ok — área autenticada para testes de integração.
      </p>
    </div>
  )
}
