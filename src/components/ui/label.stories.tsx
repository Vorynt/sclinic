import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Nome completo",
  },
  parameters: {
    docs: {
      description: {
        story: "Rótulo textual simples para identificar um campo de formulário.",
      },
    },
  },
};

export const WithInput: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="label-with-input" {...args} />
      <Input id="label-with-input" placeholder="Digite seu nome" />
    </div>
  ),
  args: {
    children: "Nome completo",
  },
  parameters: {
    docs: {
      description: {
        story: "Label associado a um Input via htmlFor e id para acessibilidade.",
      },
    },
  },
};
