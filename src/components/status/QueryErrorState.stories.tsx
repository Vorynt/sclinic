import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { QueryErrorState } from "./QueryErrorState";

const meta = {
  title: "Molecules/QueryErrorState",
  component: QueryErrorState,
  tags: ["autodocs"],
  args: {
    onRetry: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Estado de erro de query alinhado ao Empty: título, descrição e CTA para tentar novamente.",
      },
    },
  },
} satisfies Meta<typeof QueryErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: "Não foi possível carregar os pacientes.",
  },
};

export const Retrying: Story = {
  args: {
    description: "Não foi possível carregar os profissionais.",
    isRetrying: true,
  },
};

export const CustomTitle: Story = {
  args: {
    title: "Falha na conexão",
    description: "Verifique sua internet e tente carregar a agenda de novo.",
    retryLabel: "Recarregar agenda",
  },
};
