import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ComponentProps } from "react"

import { Label } from "@/components/ui/label"
import { MaskedInput } from "@/components/ui/masked-input"
import { formatMask, type MaskName } from "@/utils/mask"

const meta = {
  title: "Atoms/MaskedInput",
  component: MaskedInput,
  tags: ["autodocs"],
  argTypes: {
    mask: {
      control: "select",
      options: ["cpf", "cnpj", "phone", "cep"] satisfies MaskName[],
      description: "Máscara aplicada na UI.",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof MaskedInput>

export default meta
type Story = StoryObj<typeof meta>

function Demo(props: ComponentProps<typeof MaskedInput>) {
  const [raw, setRaw] = useState("")

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="masked-demo">Valor mascarado</Label>
      <MaskedInput
        id="masked-demo"
        {...props}
        onChange={(event) => setRaw(event.target.value)}
      />
      <p className="text-muted-foreground text-xs">
        Valor no formulário (sem máscara): <code>{raw || "—"}</code>
      </p>
      <p className="text-muted-foreground text-xs">
        Renderização: <code>{raw ? formatMask(raw, props.mask) : "—"}</code>
      </p>
    </div>
  )
}

export const Cpf: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    mask: "cpf",
    placeholder: "000.000.000-00",
  },
}

export const Cnpj: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    mask: "cnpj",
    placeholder: "00.000.000/0000-00",
  },
}

export const Phone: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    mask: "phone",
    placeholder: "(00) 00000-0000",
  },
}

export const Cep: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    mask: "cep",
    placeholder: "00000-000",
  },
}
