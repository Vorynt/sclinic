"use client"

import { Separator } from "@/components/ui/separator"
import { AccountSessionsPanel } from "@/modules/authentication/components/AccountSessionsPanel"
import { TwoFactorSetupPanel } from "@/modules/authentication/components/TwoFactorSetupPanel"
import { AccountSecurityForm } from "@/modules/users/components/AccountSecurityForm"

export function AccountSecurityPanel() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            Senha
          </h3>
          <p className="text-sm text-muted-foreground">
            Altere a senha de acesso à sua conta.
          </p>
        </div>
        <AccountSecurityForm />
      </section>
      <Separator />
      <TwoFactorSetupPanel />
      <Separator />
      <AccountSessionsPanel />
    </div>
  )
}
