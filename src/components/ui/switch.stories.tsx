import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Label } from "./label";
import { Switch } from "./switch";

const sizes = ["sm", "default"] as const;

const meta = {
  title: "Atoms/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: [...sizes],
      description: "Tamanho visual do interruptor.",
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
          "Interruptor on/off baseado em Radix UI para alternar estados booleanos.",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Estado padrão desligado com tamanho default.",
      },
    },
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Switch ligado por padrão.",
      },
    },
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
  parameters: {
    docs: {
      description: {
        story: "Variante compacta para interfaces densas.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Switch indisponível para interação.",
      },
    },
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-with-label" {...args} />
      <Label htmlFor="switch-with-label">Notificações por e-mail</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Composição recomendada com Label associado via htmlFor e id.",
      },
    },
  },
};
