import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Progress } from "./progress";

const meta = {
  title: "Molecules/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Valor de progresso de 0 a 100.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Barra de progresso baseada em Radix UI para indicar conclusão de tarefas ou carregamento.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-75">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 40,
  },
  parameters: {
    docs: {
      description: {
        story: "Progresso parcial em 40%.",
      },
    },
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
  parameters: {
    docs: {
      description: {
        story: "Progresso concluído em 100%.",
      },
    },
  },
};

export const Low: Story = {
  args: {
    value: 5,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Valor baixo (5%) — o componente não suporta modo indeterminado; use um valor mínimo para simular início de carregamento.",
      },
    },
  },
};
