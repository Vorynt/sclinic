import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { NotFoundBlock } from "./NotFoundBlock"

const meta = {
  title: "Molecules/NotFoundBlock",
  component: NotFoundBlock,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tela de recurso não encontrado (404) com ícone, mensagem e CTA para o início.",
      },
    },
  },
} satisfies Meta<typeof NotFoundBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
