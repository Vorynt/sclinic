"use client"

import { CompassIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ProductTourPromptDialogProps = {
  open: boolean
  onStart: () => void
  onSkip: () => void
}

export function ProductTourPromptDialog({
  open,
  onStart,
  onSkip,
}: ProductTourPromptDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onSkip()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CompassIcon className="size-5" weight="bold" aria-hidden />
          </div>
          <DialogTitle>Conheça o sclinic</DialogTitle>
          <DialogDescription>
            Um tour rápido mostra onde ficam as telas na barra de navegação —
            Início, agenda, pacientes e o restante em Mais. Você pode pular e
            ver depois em Ajuda.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onSkip}>
            Agora não
          </Button>
          <Button type="button" onClick={onStart}>
            Ver tutorial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
