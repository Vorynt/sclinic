"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  PrescriptionBlock,
  PrescriptionDocumentModel,
} from "@/modules/medical-records/prescription-template-designer";
import { TemplateBlockItem } from "@/modules/medical-records/prescription-template-designer/components/TemplateBlockItem";
import { TemplateBlockPalette } from "@/modules/medical-records/prescription-template-designer/components/TemplateBlockPalette";
import { TemplateLiveCanvas } from "@/modules/medical-records/prescription-template-designer/components/TemplateLiveCanvas";

type TemplateBlockEditorProps = {
  name: string;
  onNameChange: (name: string) => void;
  model: PrescriptionDocumentModel;
  onModelChange: (model: PrescriptionDocumentModel) => void;
};

function moveBlock(
  blocks: PrescriptionBlock[],
  from: number,
  to: number,
): PrescriptionBlock[] {
  if (to < 0 || to >= blocks.length) return blocks;
  const next = [...blocks];
  const [item] = next.splice(from, 1);
  if (!item) return blocks;
  next.splice(to, 0, item);
  return next;
}

export function TemplateBlockEditor({
  name,
  onNameChange,
  model,
  onModelChange,
}: TemplateBlockEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    model.blocks[0]?.id ?? null,
  );

  function updateBlocks(blocks: PrescriptionBlock[]) {
    onModelChange({ ...model, blocks });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template-name">Nome do modelo</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex.: Padrão, Controlados"
            maxLength={80}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Adicionar bloco</p>
          <TemplateBlockPalette
            model={model}
            onAdd={(block) => {
              updateBlocks([...model.blocks, block]);
              setSelectedId(block.id);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Blocos (ordem na folha)</p>
          <div className="flex flex-col gap-2">
            {model.blocks.map((block, index) => (
              <TemplateBlockItem
                key={block.id}
                block={block}
                index={index}
                total={model.blocks.length}
                selected={selectedId === block.id}
                onSelect={() => setSelectedId(block.id)}
                onChange={(next) => {
                  updateBlocks(
                    model.blocks.map((b) => (b.id === next.id ? next : b)),
                  );
                }}
                onMoveUp={() =>
                  updateBlocks(moveBlock(model.blocks, index, index - 1))
                }
                onMoveDown={() =>
                  updateBlocks(moveBlock(model.blocks, index, index + 1))
                }
                onRemove={() => {
                  if (block.type === "body") return;
                  const next = model.blocks.filter((b) => b.id !== block.id);
                  updateBlocks(next);
                  if (selectedId === block.id) {
                    setSelectedId(next[0]?.id ?? null);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 ">
        <p className="text-sm font-medium">Visualização</p>
        <TemplateLiveCanvas model={model} className="min-h-105" />
      </div>
    </div>
  );
}
