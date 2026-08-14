"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BackupCodesList,
  copyBackupCodes,
} from "@/modules/authentication/components/BackupCodesList"

type BackupCodesDialogProps = {
  open: boolean
  codes: string[]
  title: string
  description: string
  onOpenChange: (open: boolean) => void
}

export function BackupCodesDialog({
  open,
  codes,
  title,
  description,
  onOpenChange,
}: BackupCodesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <BackupCodesList codes={codes} />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void copyBackupCodes(codes).then(() => {
                toast.success("Códigos copiados")
              })
            }}
          >
            Copiar
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Guardei os códigos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
