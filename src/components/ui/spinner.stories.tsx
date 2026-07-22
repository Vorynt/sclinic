import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Spinner } from "./spinner";

const meta = {
  title: "Molecules/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Indicador de carregamento animado com ícone Phosphor e acessibilidade via role e aria-label.",
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" />
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Tamanhos customizados via className (size-3 a size-8).",
      },
    },
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner />
      <span className="text-sm text-muted-foreground">Carregando dados...</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Composição com texto descritivo ao lado do spinner.",
      },
    },
  },
};
