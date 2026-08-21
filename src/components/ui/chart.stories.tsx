import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const data = [
  { month: "Jan", received: 18600, pending: 8000 },
  { month: "Fev", received: 30500, pending: 4200 },
  { month: "Mar", received: 23700, pending: 9100 },
]

const chartConfig = {
  received: { label: "Recebido", color: "var(--chart-1)" },
  pending: { label: "A receber", color: "var(--chart-3)" },
} satisfies ChartConfig

const meta = {
  title: "Molecules/Chart",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Container de gráfico (recharts) alinhado aos tokens `chart-*` do tema.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Bars: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="received" fill="var(--color-received)" radius={4} />
        <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
}
