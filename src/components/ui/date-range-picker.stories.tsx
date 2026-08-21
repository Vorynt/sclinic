import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ComponentProps } from "react"

import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/ui/date-range-picker"
import { Field, FieldLabel } from "@/components/ui/field"

const meta = {
  title: "Molecules/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Seletor de intervalo de datas (Popover + Calendar em modo range). Valores controlados em `YYYY-MM-DD`.",
      },
    },
  },
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

function Demo(props: ComponentProps<typeof DateRangePicker>) {
  const [value, setValue] = useState<DateRangeValue>(props.value ?? {})

  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="date-range-demo">Período</FieldLabel>
      <DateRangePicker
        {...props}
        id="date-range-demo"
        value={value}
        onChange={setValue}
      />
      <p className="text-muted-foreground text-xs">
        Valor (ISO):{" "}
        <code>
          {value.from || "—"} → {value.to || "—"}
        </code>
      </p>
    </Field>
  )
}

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    placeholder: "Selecione o período",
  },
}

export const Prefilled: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: { from: "2026-08-01", to: "2026-08-31" },
  },
}

export const Disabled: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    disabled: true,
    value: { from: "2026-08-01", to: "2026-08-15" },
  },
}
