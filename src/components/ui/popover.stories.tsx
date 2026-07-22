import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

const meta = {
  title: "Molecules/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "Popover flutuante ancorado a um trigger, ideal para conteúdo contextual, formulários compactos e informações adicionais.",
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Popover básico com trigger e conteúdo textual.",
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensões</PopoverTitle>
          <PopoverDescription>
            Defina as dimensões da camada. Valores são aplicados em pixels.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  parameters: {
    docs: {
      description: {
        story: "Popover com formulário compacto usando Label, Input e Button.",
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Atualizar perfil</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Atualizar perfil</PopoverTitle>
          <PopoverDescription>
            Altere seu nome de exibição. Clique em salvar quando terminar.
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="popover-name">Nome</Label>
            <Input id="popover-name" defaultValue="Maria Silva" />
          </div>
          <Button size="sm">Salvar alterações</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
