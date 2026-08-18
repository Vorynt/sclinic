import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState, type ComponentProps } from "react"

import { ColorPicker } from "@/components/ui/color-picker"
import { Field, FieldLabel } from "@/components/ui/field"

const meta = {
  title: "Molecules/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Seletor de cor (área 2D + matiz + hex/RGB/HSL). Valor controlado em `#RRGGBB`.",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

function Demo(props: ComponentProps<typeof ColorPicker>) {
  const [value, setValue] = useState(props.value ?? "#1e4d6b")

  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="color-picker-demo">Cor</FieldLabel>
      <ColorPicker
        {...props}
        id="color-picker-demo"
        value={value}
        onChange={setValue}
      />
      <p className="text-muted-foreground text-xs">
        Valor (hex): <code>{value || "—"}</code>
      </p>
    </Field>
  )
}

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    value: "#1e4d6b",
  },
}

export const Disabled: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    disabled: true,
    value: "#1e4d6b",
  },
}

export const Invalid: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    "aria-invalid": true,
    value: "#1e4d6b",
  },
}
