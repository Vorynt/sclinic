import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextBIcon, TextItalicIcon, TextUnderlineIcon } from "@phosphor-icons/react";

import { Toggle } from "./toggle";

const variants = ["default", "outline"] as const;
const sizes = ["sm", "default", "lg"] as const;

const meta = {
  title: "Molecules/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
      description: "Estilo visual do toggle.",
    },
    size: {
      control: "select",
      options: [...sizes],
      description: "Tamanho do toggle.",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita interação e aplica estilo visual correspondente.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Botão de alternância (pressed/unpressed) baseado em Radix UI para estados binários ou seleção visual.",
      },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Toggle",
    "aria-label": "Alternar",
  },
  parameters: {
    docs: {
      description: {
        story: "Estado padrão desligado.",
      },
    },
  },
};

export const Pressed: Story = {
  args: {
    children: "Toggle",
    "aria-label": "Alternar",
    defaultPressed: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Toggle ativado por padrão (pressed).",
      },
    },
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Toggle aria-label="Negrito">
        <TextBIcon />
      </Toggle>
      <Toggle aria-label="Itálico">
        <TextItalicIcon />
      </Toggle>
      <Toggle aria-label="Sublinhado">
        <TextUnderlineIcon />
      </Toggle>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Toggle com ícones Phosphor, comum em barras de formatação.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    children: "Toggle",
    "aria-label": "Alternar",
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Toggle indisponível para interação.",
      },
    },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {variants.map((variant) => (
        <Toggle key={variant} variant={variant} aria-label={`Toggle ${variant}`}>
          {variant}
        </Toggle>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Variantes visuais disponíveis: default e outline.",
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {sizes.map((size) => (
        <Toggle key={size} size={size} aria-label={`Toggle ${size}`}>
          {size}
        </Toggle>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tamanhos disponíveis: sm, default e lg.",
      },
    },
  },
};
