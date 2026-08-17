"use client"

import { ShieldCheckIcon } from "@phosphor-icons/react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { routes } from "@/config/routes"
import { useAuthUiStore } from "@/stores/auth.store"
import { useProductTourUiStore } from "@/stores/product-tour.store"

export function TwoFactorNudgeDialog() {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useAuthUiStore((s) => s.pendingTwoFactorNudge)
  const dismiss = useAuthUiStore((s) => s.dismissTwoFactorNudge)
  const tourBlocking = useProductTourUiStore(
    (s) => s.isPromptOpen || s.isTourActive,
  )

  const open = pending && pathname !== routes.accountSecurity && !tourBlocking

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismiss()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-5" weight="bold" aria-hidden />
          </div>
          <DialogTitle>Sua conta ainda está desprotegida</DialogTitle>
          <DialogDescription>
            Sem autenticação em duas etapas, sua senha é a única barreira entre
            um invasor e os dados da clínica. Se ela vazar, alguém entra no seu
            nome — e não há segunda trava para impedir.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => dismiss()}>
            Continuar desprotegido
          </Button>
          <Button
            type="button"
            onClick={() => {
              dismiss()
              router.push(routes.accountSecurity)
            }}
          >
            Proteger agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
