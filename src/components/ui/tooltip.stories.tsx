import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "Tooltip contextual exibido ao passar o mouse ou focar em um elemento, com suporte a posicionamento e delay.",
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tooltip básico com Button como trigger.",
      },
    },
  },
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Passe o mouse</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Informação adicional sobre esta ação.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Sides: Story = {
  parameters: {
    docs: {
      description: {
        story: "Posicionamento do tooltip em top, right, bottom e left.",
      },
    },
  },
  render: () => (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-8">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="outline">{side}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
              <p>Tooltip {side}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};

export const Delay: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tooltip com delay de 400ms antes de aparecer.",
      },
    },
  },
  render: () => (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Delay 400ms</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Este tooltip aparece após 400ms.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
