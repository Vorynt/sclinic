import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "Atoms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "Observações sobre o atendimento.",
  },
  parameters: {
    docs: {
      description: {
        story: "Estado padrão do campo de texto multilinha.",
      },
    },
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: "Descreva os sintomas ou observações clínicas...",
  },
  parameters: {
    docs: {
      description: {
        story: "Campo com placeholder para orientar o preenchimento.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Conteúdo somente leitura.",
  },
  parameters: {
    docs: {
      description: {
        story: "Campo indisponível para edição.",
      },
    },
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "Texto com erro de validação.",
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
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="textarea-with-label">Observações</Label>
      <Textarea id="textarea-with-label" {...args} />
    </div>
  ),
  args: {
    placeholder: "Descreva os sintomas ou observações clínicas...",
  },
  parameters: {
    docs: {
      description: {
        story: "Composição recomendada com Label associado via htmlFor e id.",
      },
    },
  },
};
