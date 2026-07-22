import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

import { Button } from "./button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group";

const meta = {
  title: "Molecules/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Molécula que agrupa botões adjacentes com bordas compartilhadas, separador opcional e texto auxiliar.",
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Grupo horizontal com dois ou três botões encostados.",
      },
    },
  },
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Anterior</Button>
      <Button variant="outline">Atual</Button>
      <Button variant="outline">Próximo</Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "ButtonGroupSeparator divide ações relacionadas dentro do mesmo grupo.",
      },
    },
  },
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Página anterior">
        <CaretLeftIcon />
      </Button>
      <ButtonGroupText>Página 2 de 10</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="outline" size="icon" aria-label="Próxima página">
        <CaretRightIcon />
      </Button>
    </ButtonGroup>
  ),
};

export const OutlineGroup: Story = {
  parameters: {
    docs: {
      description: {
        story: "Grupo com variant outline para ações secundárias discretas.",
      },
    },
  },
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Dia</Button>
      <Button variant="outline">Semana</Button>
      <Button variant="outline">Mês</Button>
    </ButtonGroup>
  ),
};
