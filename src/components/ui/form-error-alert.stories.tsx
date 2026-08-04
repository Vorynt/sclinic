import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { FormErrorAlert } from "./form-error-alert"

const meta = {
  title: "Molecules/FormErrorAlert",
  component: FormErrorAlert,
  args: {
    message: "E-mail ou senha inválidos.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Alerta de erro de formulário com descrição legível. Ao montar, rola até o alerta para ficar visível em containers com scroll.",
      },
    },
  },
} satisfies Meta<typeof FormErrorAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ValidationFailed: Story = {
  args: {
    message: "Verifique os campos e tente novamente.",
  },
}

export const InternalError: Story = {
  args: {
    message: "Algo deu errado. Tente novamente.",
  },
}

export const FromErrorCode: Story = {
  args: {
    message: "INVALID_CREDENTIALS",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Se a mensagem for um código estável, o alerta mapeia para o texto amigável via getClientMessage.",
      },
    },
  },
}
