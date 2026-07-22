import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "Atoms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Desabilita todos os itens do grupo.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Grupo de opções mutuamente exclusivas baseado em Radix UI para seleção única.",
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup defaultValue="presencial" {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="presencial" id="radio-presencial" />
        <Label htmlFor="radio-presencial">Presencial</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="teleconsulta" id="radio-teleconsulta" />
        <Label htmlFor="radio-teleconsulta">Teleconsulta</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="domiciliar" id="radio-domiciliar" />
        <Label htmlFor="radio-domiciliar">Domiciliar</Label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Grupo com três opções e valor inicial selecionado.",
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => (
    <RadioGroup defaultValue="presencial" disabled {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="presencial" id="radio-disabled-presencial" />
        <Label htmlFor="radio-disabled-presencial">Presencial</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="teleconsulta" id="radio-disabled-teleconsulta" />
        <Label htmlFor="radio-disabled-teleconsulta">Teleconsulta</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="domiciliar" id="radio-disabled-domiciliar" />
        <Label htmlFor="radio-disabled-domiciliar">Domiciliar</Label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Grupo inteiro indisponível para interação.",
      },
    },
  },
};

export const WithDescriptions: Story = {
  render: (args) => (
    <RadioGroup defaultValue="basico" className="max-w-sm" {...args}>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="basico" id="radio-basico" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="radio-basico">Plano básico</Label>
          <p className="text-muted-foreground text-sm">
            Consultas presenciais com agenda compartilhada.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="profissional" id="radio-profissional" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="radio-profissional">Plano profissional</Label>
          <p className="text-muted-foreground text-sm">
            Inclui teleconsulta e lembretes automáticos por SMS.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="enterprise" id="radio-enterprise" className="mt-0.5" />
        <div className="grid gap-1">
          <Label htmlFor="radio-enterprise">Plano enterprise</Label>
          <p className="text-muted-foreground text-sm">
            Multi-unidade, relatórios avançados e suporte prioritário.
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Opções com rótulo e descrição auxiliar para contexto adicional.",
      },
    },
  },
};
