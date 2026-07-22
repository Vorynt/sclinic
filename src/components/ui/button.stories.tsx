import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlusIcon } from "@phosphor-icons/react";

import { Button } from "./button";

const variants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const sizes = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: {
    children: "Button",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
    size: {
      control: "select",
      options: [...sizes],
    },
    disabled: {
      control: "boolean",
    },
    asChild: {
      control: "boolean",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Botão reutilizável do design system com variantes visuais, tamanhos e suporte a ícones.",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {sizes.map((size) => (
        <Button key={size} size={size}>
          {size.startsWith("icon") ? <PlusIcon /> : size}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>
        <PlusIcon />
        Adicionar
      </Button>
      <Button variant="outline">
        Adicionar
        <PlusIcon />
      </Button>
      <Button size="icon" aria-label="Adicionar">
        <PlusIcon />
      </Button>
    </div>
  ),
};
