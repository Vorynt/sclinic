import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { FormErrorAlert } from "./form-error-alert"

const meta = {
  title: "Molecules/FormErrorAlert",
  component: FormErrorAlert,
  args: {
    message: "E-mail ou senha inválidos.",
    code: "INVALID_CREDENTIALS",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Alerta de erro de formulário com mensagem legível e código estável em mono para suporte.",
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
    code: "VALIDATION_FAILED",
  },
}

export const InternalError: Story = {
  args: {
    message: "Algo deu errado. Tente novamente.",
    code: "INTERNAL_ERROR",
  },
}
