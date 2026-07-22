import {
  AlignLeftIcon,
  AlignRightIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  TextAlignCenterIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta = {
  title: "Molecules/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Grupo de toggles para seleção única ou múltipla, com variantes e tamanhos compartilhados.",
      },
    },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: {
    type: "single",
    defaultValue: "center",
    disabled: false,
    rovingFocus: false,
    spacing: 0,
  },
  render: () => (
    <ToggleGroup type="single" defaultValue="center">
      <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
        Esquerda
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Centralizar">
        Centro
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Alinhar à direita">
        Direita
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Seleção única — apenas um item pode estar ativo por vez.",
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    type: "multiple",
    defaultValue: ["bold"],
    disabled: false,
    rovingFocus: false,
    spacing: 0,
  },
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["bold"]}>
      <ToggleGroupItem value="bold" aria-label="Negrito">
        Negrito
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Itálico">
        Itálico
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Sublinhado">
        Sublinhado
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Seleção múltipla — vários itens podem estar ativos simultaneamente.",
      },
    },
  },
};

export const Outline: Story = {
  args: {
    type: "single",
    variant: "outline",
    defaultValue: "a",
    disabled: false,
    rovingFocus: false,
    spacing: 0,
  },
  render: () => (
    <ToggleGroup type="single" variant="outline" defaultValue="a">
      <ToggleGroupItem value="a" aria-label="Opção A">
        Opção A
      </ToggleGroupItem>
      <ToggleGroupItem value="b" aria-label="Opção B">
        Opção B
      </ToggleGroupItem>
      <ToggleGroupItem value="c" aria-label="Opção C">
        Opção C
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Variante outline com borda visível em cada item.",
      },
    },
  },
};

export const WithIcons: Story = {
  args: {
    type: "single",
    defaultValue: "left",
    variant: "outline",
    disabled: false,
    rovingFocus: false,
    spacing: 0,
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Alinhar à esquerda">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Centralizar">
          <TextAlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Alinhar à direita">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" variant="outline" defaultValue="bullets">
        <ToggleGroupItem value="bullets" aria-label="Lista com marcadores">
          <ListBulletsIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="numbers" aria-label="Lista numerada">
          <ListNumbersIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Grupos com ícones Phosphor para ações de formatação e alinhamento.",
      },
    },
  },
};
