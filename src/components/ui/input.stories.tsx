import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url", "file"],
      description: "Tipo nativo do elemento input.",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita interação e aplica estilo visual correspondente.",
    },
    placeholder: {
      control: "text",
      description: "Texto exibido quando o campo está vazio.",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Digite algo",
  },
  parameters: {
    docs: {
      description: {
        story: "Estado padrão do campo de texto.",
      },
    },
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: "Ex.: joao@clinica.com",
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
    placeholder: "Campo desabilitado",
    defaultValue: "Valor bloqueado",
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
    defaultValue: "valor-invalido",
    placeholder: "Campo inválido",
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
      <Label htmlFor="input-with-label">Nome completo</Label>
      <Input id="input-with-label" {...args} />
    </div>
  ),
  args: {
    placeholder: "Digite seu nome",
  },
  parameters: {
    docs: {
      description: {
        story: "Composição recomendada com Label associado via htmlFor e id.",
      },
    },
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Digite sua senha",
  },
  parameters: {
    docs: {
      description: {
        story: "Campo do tipo password para ocultar caracteres sensíveis.",
      },
    },
  },
};

export const File: Story = {
  args: {
    type: "file",
  },
  parameters: {
    docs: {
      description: {
        story: "Campo para seleção de arquivo com estilos nativos ajustados.",
      },
    },
  },
};
