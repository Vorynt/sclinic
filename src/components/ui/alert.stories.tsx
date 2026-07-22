import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InfoIcon, WarningCircleIcon } from "@phosphor-icons/react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "./alert";
import { Button } from "./button";

const variants = ["default", "destructive"] as const;

const meta = {
  title: "Atoms/Alert",
  component: Alert,
  args: {
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...variants],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Alerta inline para comunicar informações, avisos ou erros com título, descrição e ação opcional.",
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Alerta padrão com ícone, título e descrição para mensagens informativas.",
      },
    },
  },
  render: () => (
    <Alert>
      <InfoIcon />
      <AlertTitle>Atualização disponível</AlertTitle>
      <AlertDescription>
        Uma nova versão do sistema está pronta para instalação.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Variante destrutiva para erros, falhas ou situações que exigem atenção imediata.",
      },
    },
  },
  render: () => (
    <Alert variant="destructive">
      <WarningCircleIcon />
      <AlertTitle>Não foi possível salvar</AlertTitle>
      <AlertDescription>
        Verifique sua conexão e tente novamente em alguns instantes.
      </AlertDescription>
    </Alert>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Alerta com ação no canto superior direito, útil para CTAs como desfazer ou revisar.",
      },
    },
  },
  render: () => (
    <Alert>
      <InfoIcon />
      <AlertTitle>Consulta reagendada</AlertTitle>
      <AlertDescription>
        O horário da consulta foi alterado para amanhã às 14h.
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm">
          Desfazer
        </Button>
      </AlertAction>
    </Alert>
  ),
};
