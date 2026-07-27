import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UsageMeter } from "./usage-meter";

const meta = {
  title: "Molecules/UsageMeter",
  component: UsageMeter,
  tags: ["autodocs"],
  args: {
    label: "Usuários",
    description: "Membros ativos da clínica",
    used: 3,
    limit: 5,
    status: "ok",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["ok", "at_capacity", "over_limit"],
      description: "Estado visual derivado do uso vs limite.",
    },
    limit: {
      control: { type: "number" },
      description: "Teto do plano. Use null para ilimitado.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Medidor genérico de consumo (usado / limite) com barra de progresso e badge de status. Ideal para quotas de plano.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UsageMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Uso confortável dentro do limite do plano.",
      },
    },
  },
};

export const AtCapacity: Story = {
  args: {
    label: "Profissionais",
    description: "Profissionais de saúde vinculados",
    used: 2,
    limit: 2,
    status: "at_capacity",
  },
  parameters: {
    docs: {
      description: {
        story: "Uso igual ao limite — próximas criações devem ser bloqueadas.",
      },
    },
  },
};

export const OverLimit: Story = {
  args: {
    label: "Usuários",
    description: "Membros ativos da clínica",
    used: 7,
    limit: 5,
    status: "over_limit",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Clínica acima do plano (modo over_limit) — destaque destrutivo.",
      },
    },
  },
};

export const Unlimited: Story = {
  args: {
    label: "Armazenamento",
    description: "Arquivos e anexos",
    used: 1_250_000_000,
    limit: null,
    status: "ok",
    formatValue: (bytes) => {
      const gb = bytes / (1024 * 1024 * 1024);
      return `${gb.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} GB`;
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Limite `null` exibe “Ilimitado” e barra vazia; `formatValue` customiza a unidade.",
      },
    },
  },
};

export const Stack: Story = {
  parameters: {
    docs: {
      description: {
        story: "Várias dimensões empilhadas, como na página de uso do plano.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <UsageMeter
        label="Usuários"
        description="Membros ativos da clínica"
        used={4}
        limit={5}
        status="ok"
      />
      <UsageMeter
        label="Profissionais"
        description="Profissionais de saúde vinculados"
        used={2}
        limit={2}
        status="at_capacity"
      />
      <UsageMeter
        label="Armazenamento"
        description="Arquivos e anexos"
        used={900}
        limit={1024}
        status="ok"
        formatValue={(n) => `${n} MB`}
      />
    </div>
  ),
};
