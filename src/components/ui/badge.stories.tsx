import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StarIcon } from "@phosphor-icons/react";

import { Badge } from "./badge";

const variants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: {
    children: "Badge",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
    asChild: {
      control: "boolean",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Etiqueta compacta para status, categorias e metadados visuais.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>
        <StarIcon />
        Destaque
      </Badge>
      <Badge variant="secondary">
        Destaque
        <StarIcon />
      </Badge>
    </div>
  ),
};
