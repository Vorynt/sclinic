"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  PRESCRIPTION_BLOCK_CATALOG,
  type BlockAlign,
  type PrescriptionBlock,
} from "@/modules/medical-records/prescription-template-designer"

type TemplateBlockItemProps = {
  block: PrescriptionBlock
  index: number
  total: number
  selected: boolean
  onSelect: () => void
  onChange: (block: PrescriptionBlock) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

function blockLabel(type: PrescriptionBlock["type"]): string {
  return (
    PRESCRIPTION_BLOCK_CATALOG.find((c) => c.type === type)?.label ?? type
  )
}

function AlignSelect({
  value,
  onChange,
}: {
  value: BlockAlign
  onChange: (value: BlockAlign) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Alinhamento</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as BlockAlign)}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Esquerda</SelectItem>
          <SelectItem value="center">Centro</SelectItem>
          <SelectItem value="right">Direita</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function Flag({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  )
}

function BlockPropsEditor({
  block,
  onChange,
}: {
  block: PrescriptionBlock
  onChange: (block: PrescriptionBlock) => void
}) {
  switch (block.type) {
    case "letterhead":
      return (
        <div className="flex flex-col gap-3">
          <AlignSelect
            value={block.props.align}
            onChange={(align) =>
              onChange({ ...block, props: { ...block.props, align } })
            }
          />
          <Flag
            id={`${block.id}-doc`}
            label="Mostrar CNPJ/documento"
            checked={block.props.showDocument}
            onCheckedChange={(showDocument) =>
              onChange({ ...block, props: { ...block.props, showDocument } })
            }
          />
          <Flag
            id={`${block.id}-addr`}
            label="Mostrar endereço"
            checked={block.props.showAddress}
            onCheckedChange={(showAddress) =>
              onChange({ ...block, props: { ...block.props, showAddress } })
            }
          />
          <Flag
            id={`${block.id}-phone`}
            label="Mostrar telefone"
            checked={block.props.showPhone}
            onCheckedChange={(showPhone) =>
              onChange({ ...block, props: { ...block.props, showPhone } })
            }
          />
          <Flag
            id={`${block.id}-email`}
            label="Mostrar e-mail"
            checked={block.props.showEmail}
            onCheckedChange={(showEmail) =>
              onChange({ ...block, props: { ...block.props, showEmail } })
            }
          />
        </div>
      )
    case "title":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${block.id}-title`}>Texto</Label>
            <Input
              id={`${block.id}-title`}
              value={block.props.text}
              onChange={(e) =>
                onChange({
                  ...block,
                  props: { ...block.props, text: e.target.value },
                })
              }
            />
          </div>
          <AlignSelect
            value={block.props.align}
            onChange={(align) =>
              onChange({ ...block, props: { ...block.props, align } })
            }
          />
        </div>
      )
    case "patient":
      return (
        <div className="flex flex-col gap-3">
          <AlignSelect
            value={block.props.align}
            onChange={(align) =>
              onChange({ ...block, props: { ...block.props, align } })
            }
          />
          <Flag
            id={`${block.id}-pdoc`}
            label="Mostrar documento"
            checked={block.props.showDocument}
            onCheckedChange={(showDocument) =>
              onChange({ ...block, props: { ...block.props, showDocument } })
            }
          />
        </div>
      )
    case "body":
      return (
        <div className="flex flex-col gap-3">
          <AlignSelect
            value={block.props.align}
            onChange={(align) =>
              onChange({ ...block, props: { ...block.props, align } })
            }
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${block.id}-minh`}>Altura mínima (mm)</Label>
            <Input
              id={`${block.id}-minh`}
              type="number"
              min={20}
              max={250}
              value={block.props.minHeightMm}
              onChange={(e) =>
                onChange({
                  ...block,
                  props: {
                    ...block.props,
                    minHeightMm: Number(e.target.value) || 140,
                  },
                })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Este bloco recebe o conteúdo da receita (obrigatório e único).
          </p>
        </div>
      )
    case "professional":
      return (
        <div className="flex flex-col gap-3">
          <AlignSelect
            value={block.props.align}
            onChange={(align) =>
              onChange({ ...block, props: { ...block.props, align } })
            }
          />
          <Flag
            id={`${block.id}-sign`}
            label="Linha de assinatura"
            checked={block.props.showSignLine}
            onCheckedChange={(showSignLine) =>
              onChange({ ...block, props: { ...block.props, showSignLine } })
            }
          />
          <Flag
            id={`${block.id}-council`}
            label="Mostrar conselho"
            checked={block.props.showCouncil}
            onCheckedChange={(showCouncil) =>
              onChange({ ...block, props: { ...block.props, showCouncil } })
            }
          />
          <Flag
            id={`${block.id}-spec`}
            label="Mostrar especialidade"
            checked={block.props.showSpecialty}
            onCheckedChange={(showSpecialty) =>
              onChange({ ...block, props: { ...block.props, showSpecialty } })
            }
          />
          <Flag
            id={`${block.id}-issued`}
            label="Mostrar data de emissão"
            checked={block.props.showIssuedAt}
            onCheckedChange={(showIssuedAt) =>
              onChange({ ...block, props: { ...block.props, showIssuedAt } })
            }
          />
        </div>
      )
    case "text":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${block.id}-text`}>Texto</Label>
            <Textarea
              id={`${block.id}-text`}
              rows={3}
              value={block.props.text}
              onChange={(e) =>
                onChange({
                  ...block,
                  props: { ...block.props, text: e.target.value },
                })
              }
            />
          </div>
          <AlignSelect
            value={block.props.align}
            onChange={(align) =>
              onChange({ ...block, props: { ...block.props, align } })
            }
          />
        </div>
      )
    case "divider":
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${block.id}-th`}>Espessura (px)</Label>
          <Input
            id={`${block.id}-th`}
            type="number"
            min={1}
            max={8}
            value={block.props.thicknessPx}
            onChange={(e) =>
              onChange({
                ...block,
                props: {
                  ...block.props,
                  thicknessPx: Number(e.target.value) || 1,
                },
              })
            }
          />
        </div>
      )
    case "spacer":
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${block.id}-h`}>Altura (mm)</Label>
          <Input
            id={`${block.id}-h`}
            type="number"
            min={2}
            max={80}
            value={block.props.heightMm}
            onChange={(e) =>
              onChange({
                ...block,
                props: {
                  ...block.props,
                  heightMm: Number(e.target.value) || 8,
                },
              })
            }
          />
        </div>
      )
  }
}

export function TemplateBlockItem({
  block,
  index,
  total,
  selected,
  onSelect,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: TemplateBlockItemProps) {
  const canRemove = block.type !== "body"

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card",
        selected && "ring-2 ring-ring",
      )}
    >
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <button
          type="button"
          className="min-w-0 flex-1 truncate px-1 text-left text-sm font-medium"
          onClick={onSelect}
        >
          {index + 1}. {blockLabel(block.type)}
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label="Mover para cima"
        >
          <ArrowUpIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={index >= total - 1}
          onClick={onMoveDown}
          aria-label="Mover para baixo"
        >
          <ArrowDownIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label="Remover bloco"
        >
          <TrashIcon className="size-3.5" />
        </Button>
      </div>
      {selected ? (
        <div className="p-3">
          <BlockPropsEditor block={block} onChange={onChange} />
        </div>
      ) : null}
    </div>
  )
}
