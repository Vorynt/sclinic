import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"

import { ptBR } from "react-day-picker/locale"

import { Calendar } from "@/components/ui/calendar"

const meta = {
  title: "Atoms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Calendário baseado em react-day-picker (shadcn). Use sozinho ou composto no DatePicker.",
      },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return (
      <Calendar
        mode="single"
        locale={ptBR}
        selected={date}
        onSelect={setDate}
      />
    )
  },
}

export const DropdownCaption: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Caption com dropdowns de mês/ano — útil para data de nascimento.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        locale={ptBR}
        selected={date}
        onSelect={setDate}
        captionLayout="dropdown"
        startMonth={new Date(1900, 0)}
        endMonth={new Date()}
        disabled={{ after: new Date() }}
      />
    )
  },
}
