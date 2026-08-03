import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Slider } from "./slider";

const meta = {
  title: "Atoms/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Desabilita interação e aplica opacidade reduzida.",
    },
    min: {
      control: { type: "number" },
      description: "Valor mínimo do intervalo.",
    },
    max: {
      control: { type: "number" },
      description: "Valor máximo do intervalo.",
    },
    step: {
      control: { type: "number" },
      description: "Incremento entre valores.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controle deslizante baseado em Radix UI para escolher um valor contínuo dentro de um intervalo.",
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
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [40],
    max: 100,
    step: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Valor inicial em 40%.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [25],
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Estado desabilitado.",
      },
    },
  },
};
