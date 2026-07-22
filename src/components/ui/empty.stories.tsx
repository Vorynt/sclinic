import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlusIcon, UsersIcon } from "@phosphor-icons/react";

import { Button } from "./button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

const meta = {
  title: "Molecules/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Molécula de estado vazio para listas ou seções sem conteúdo, com título, descrição, ícone e CTA opcional.",
      },
    },
  },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Estado vazio padrão quando nenhum paciente foi encontrado na listagem.",
      },
    },
  },
  render: () => (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyTitle>Nenhum paciente encontrado</EmptyTitle>
        <EmptyDescription>
          Não há pacientes cadastrados ou os filtros aplicados não retornaram
          resultados.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty com botão de ação primária para conduzir o usuário ao próximo passo.",
      },
    },
  },
  render: () => (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyTitle>Nenhum paciente encontrado</EmptyTitle>
        <EmptyDescription>
          Comece cadastrando o primeiro paciente da clínica.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>
          <PlusIcon />
          Novo paciente
        </Button>
      </EmptyContent>
    </Empty>
  ),
};

export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "EmptyMedia com ícone Phosphor para reforçar visualmente o contexto vazio.",
      },
    },
  },
  render: () => (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersIcon />
        </EmptyMedia>
        <EmptyTitle>Nenhum paciente encontrado</EmptyTitle>
        <EmptyDescription>
          Ajuste os filtros ou cadastre um novo paciente para preencher esta
          lista.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};
