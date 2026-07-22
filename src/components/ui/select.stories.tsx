import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "Atoms/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Select dropdown para escolha de uma opção entre várias, com suporte a grupos, labels e estados de validação.",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Select básico com placeholder e lista de frutas.",
      },
    },
  },
  render: () => (
    <Select>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Maçã</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Laranja</SelectItem>
        <SelectItem value="grape">Uva</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Small: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Trigger compacto com `size="sm"`.',
      },
    },
  },
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-45">
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Maçã</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Laranja</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  parameters: {
    docs: {
      description: {
        story: "Opções organizadas em grupos com labels e separador.",
      },
    },
  },
  render: () => (
    <Select>
      <SelectTrigger className="w-55">
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frutas</SelectLabel>
          <SelectItem value="apple">Maçã</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Laranja</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetais</SelectLabel>
          <SelectItem value="carrot">Cenoura</SelectItem>
          <SelectItem value="broccoli">Brócolis</SelectItem>
          <SelectItem value="spinach">Espinafre</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: "Select desabilitado — não permite interação.",
      },
    },
  },
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Maçã</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Invalid: Story = {
  parameters: {
    docs: {
      description: {
        story: "Estado de erro com `aria-invalid` no trigger.",
      },
    },
  },
  render: () => (
    <Select>
      <SelectTrigger className="w-45" aria-invalid>
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Maçã</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Laranja</SelectItem>
      </SelectContent>
    </Select>
  ),
};
