import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ForbiddenBlock } from "./ForbiddenBlock"

const meta = {
  title: "Molecules/ForbiddenBlock",
  component: ForbiddenBlock,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tela de acesso negado (403) com ícone, mensagem e ações Voltar / Ir para o início.",
      },
    },
  },
} satisfies Meta<typeof ForbiddenBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomCopy: Story = {
  args: {
    title: "Sem permissão para pacientes",
    description:
      "Seu perfil não inclui a permissão de visualizar pacientes nesta clínica.",
  },
}
