import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          "Placeholder animado para indicar carregamento de conteúdo antes dos dados reais.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-62.5" />,
  parameters: {
    docs: {
      description: {
        story: "Linha simples de carregamento com largura fixa.",
      },
    },
  },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-50" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Composição que simula o estado de carregamento de um card com avatar e linhas de texto.",
      },
    },
  },
};

export const Circle: Story = {
  render: () => <Skeleton className="size-12 rounded-full" />,
  parameters: {
    docs: {
      description: {
        story:
          "Skeleton circular, útil para avatares ou ícones em carregamento.",
      },
    },
  },
};
