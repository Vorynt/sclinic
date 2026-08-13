"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type LegalDocumentModalProps = {
  title: string
  description: string
  children: ReactNode
}

export function LegalDocumentModal({
  title,
  description,
  children,
}: LegalDocumentModalProps) {
  const router = useRouter()

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          router.back()
        }
      }}>
      <DialogContent className="flex max-h-[min(85vh,720px)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border/60 px-4 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
