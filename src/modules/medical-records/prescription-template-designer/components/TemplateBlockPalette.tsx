"use client"

import { PlusIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  PRESCRIPTION_BLOCK_CATALOG,
  createBlockDefaults,
  type PrescriptionBlock,
  type PrescriptionBlockType,
  type PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer"

type TemplateBlockPaletteProps = {
  model: PrescriptionDocumentModel
  onAdd: (block: PrescriptionBlock) => void
  disabled?: boolean
}

export function TemplateBlockPalette({
  model,
  onAdd,
  disabled,
}: TemplateBlockPaletteProps) {
  const hasBody = model.blocks.some((b) => b.type === "body")

  function handleAdd(type: PrescriptionBlockType) {
    if (type === "body" && hasBody) return
    onAdd(createBlockDefaults(type, crypto.randomUUID()))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PRESCRIPTION_BLOCK_CATALOG.map((item) => {
        const blocked = item.unique && hasBody && item.type === "body"
        return (
          <Button
            key={item.type}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || blocked}
            onClick={() => handleAdd(item.type)}
            title={item.description}
          >
            <PlusIcon className="size-3.5" />
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}
