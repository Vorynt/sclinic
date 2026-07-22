import { CaretDownIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

const meta = {
  title: "Molecules/Collapsible",
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          "Seção expansível controlada por um gatilho, útil para revelar conteúdo sob demanda.",
      },
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Gatilho com Button que expande ou recolhe o conteúdo adicional.",
      },
    },
  },
  render: () => (
    <Collapsible className="w-90 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Observações do paciente</h4>
          <p className="text-muted-foreground text-sm">
            3 anotações registradas no prontuário.
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            <CaretDownIcon />
            Ver detalhes
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 text-sm">
          <p className="font-medium">Alergia a dipirona</p>
          <p className="text-muted-foreground">
            Registrado em 12/03/2025 — reação cutânea leve.
          </p>
        </div>
        <div className="rounded-md border px-4 py-3 text-sm">
          <p className="font-medium">Preferência por teleconsulta</p>
          <p className="text-muted-foreground">
            Paciente solicita retornos por vídeo quando possível.
          </p>
        </div>
        <div className="rounded-md border px-4 py-3 text-sm">
          <p className="font-medium">Acompanhante autorizado</p>
          <p className="text-muted-foreground">
            Esposa (Ana Silva) pode receber informações do tratamento.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};
