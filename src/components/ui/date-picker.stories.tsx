import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ComponentProps } from "react"

import { DatePicker } from "@/components/ui/date-picker"
import { Field, FieldLabel } from "@/components/ui/field"

const meta = {
  title: "Molecules/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Seletor de data (Popover + Calendar). Valor controlado em `YYYY-MM-DD` (ISO date).",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
    captionLayout: {
      control: "select",
      options: ["label", "dropdown", "dropdown-months", "dropdown-years"],
    },
  },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

function Demo(props: ComponentProps<typeof DatePicker>) {
  const [value, setValue] = useState(props.value ?? "")

  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="date-picker-demo">Data</FieldLabel>
      <DatePicker
        {...props}
        id="date-picker-demo"
        value={value}
        onChange={setValue}
      />
      <p className="text-muted-foreground text-xs">
        Valor (ISO): <code>{value || "—"}</code>
      </p>
    </Field>
  )
}

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    placeholder: "Selecione a data",
    captionLayout: "dropdown",
  },
}

export const BirthDate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Padrão para data de nascimento: dropdowns de mês/ano e datas futuras desabilitadas.",
      },
    },
  },
  render: (args) => <Demo {...args} />,
  args: {
    placeholder: "Data de nascimento",
    captionLayout: "dropdown",
    startMonth: new Date(1900, 0),
    endMonth: new Date(),
    disabledDates: { after: new Date() },
    value: "1990-05-20",
  },
}

export const Disabled: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    disabled: true,
    value: "2024-01-15",
  },
}

export const Invalid: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    "aria-invalid": true,
    value: "",
    placeholder: "Campo inválido",
  },
}
