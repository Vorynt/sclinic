import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { TextShimmer } from "./text-shimmer"

const meta = {
  title: "Atoms/TextShimmer",
  component: TextShimmer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Texto com efeito shimmer contínuo, útil para créditos e destaques sutis.",
      },
    },
  },
} satisfies Meta<typeof TextShimmer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Feito com 💙 by Vorynt",
    className: "text-sm font-medium",
  },
}
