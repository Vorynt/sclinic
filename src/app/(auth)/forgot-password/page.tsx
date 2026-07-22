import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"

export const metadata: Metadata = {
  title: "Esqueci minha senha · sclinic",
  description: "Recupere o acesso à sua conta",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Esqueci minha senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Em breve você poderá redefinir sua senha por aqui. Por enquanto,
          volte ao login para testar a autenticação.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href={routes.login}>Voltar ao login</Link>
      </Button>
    </div>
  )
}
