import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { LoadingScreen } from "./LoadingScreen"

const meta = {
  title: "Molecules/LoadingScreen",
  component: LoadingScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tela cheia de loading com marca sclinic, ícone Pulse e texto em shimmer — usada em transições críticas (ex.: troca de clínica).",
      },
    },
  },
} satisfies Meta<typeof LoadingScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ClinicSwitch: Story = {
  args: {
    message: "Trocando para Clínica Centro…",
    description: "Aguarde enquanto preparamos o ambiente da nova clínica.",
  },
}
