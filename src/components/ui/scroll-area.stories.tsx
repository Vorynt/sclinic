import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ScrollArea } from "./scroll-area";

const tags = Array.from({ length: 50 }, (_, i) => `Tag ${i + 1}`);

const meta = {
  title: "Molecules/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Área com scroll customizado baseada em Radix UI, com barra de rolagem estilizada.",
      },
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VerticalList: Story = {
  render: () => (
    <ScrollArea className="h-48 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
        {tags.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story: "Lista vertical com altura fixa (h-48) e scroll interno.",
      },
    },
  },
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 rounded-md border whitespace-nowrap">
      <div className="flex w-max gap-4 p-4">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="flex size-16 shrink-0 items-center justify-center rounded-md border bg-muted text-sm"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Conteúdo horizontal com overflow e barra de rolagem customizada.",
      },
    },
  },
};
