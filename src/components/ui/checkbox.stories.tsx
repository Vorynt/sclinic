import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Desabilita interação e aplica estilo visual correspondente.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Caixa de seleção acessível baseada em Radix UI para escolhas binárias em formulários.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Estado padrão desmarcado, pronto para interação.",
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
        story: "Checkbox marcado por padrão.",
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
        story: "Checkbox indisponível para interação.",
      },
    },
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
  },
  parameters: {
    docs: {
      description: {
        story: "Estado de erro indicado via aria-invalid para acessibilidade.",
      },
    },
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-with-label" {...args} />
      <Label htmlFor="checkbox-with-label">Aceito os termos de uso</Label>
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
