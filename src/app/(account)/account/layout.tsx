import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AccountNav } from "@/modules/users/components/AccountNav"

export const metadata: Metadata = {
  title: "Minha conta · sclinic",
}

type AccountLayoutProps = {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Minha conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus dados pessoais e a segurança do acesso.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside>
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
