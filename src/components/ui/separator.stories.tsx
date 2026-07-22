import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Separator } from "./separator";

const meta = {
  title: "Atoms/Separator",
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          "Separador visual para dividir conteúdo em layouts horizontais ou verticais.",
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-70 space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">Seção superior</p>
        <p className="text-sm text-muted-foreground">
          Conteúdo acima do separador horizontal.
        </p>
      </div>
      <Separator />
      <div className="space-y-1">
        <p className="text-sm font-medium">Seção inferior</p>
        <p className="text-sm text-muted-foreground">
          Conteúdo abaixo do separador horizontal.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Separador horizontal (padrão) em um stack vertical com texto.",
      },
    },
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4">
      <span className="text-sm">Esquerda</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Centro</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Direita</span>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Separador vertical em um flex horizontal com altura h-8.",
      },
    },
  },
};
