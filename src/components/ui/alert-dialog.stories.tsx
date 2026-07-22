import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WarningIcon } from "@phosphor-icons/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

const meta = {
  title: "Molecules/AlertDialog",
  component: AlertDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal de alerta para ações destrutivas ou irreversíveis, com foco em confirmação explícita do usuário.",
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Confirmação de exclusão com ação destrutiva e opção de cancelar.",
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Excluir paciente</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O prontuário e todos os dados
            associados serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const WithMedia: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Alert dialog com ícone de mídia no cabeçalho para reforçar visualmente o aviso.",
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Cancelar consulta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <WarningIcon className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Cancelar consulta?</AlertDialogTitle>
          <AlertDialogDescription>
            O horário será liberado e o paciente será notificado. Esta ação pode
            gerar cobrança conforme a política da clínica.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Manter consulta</AlertDialogCancel>
          <AlertDialogAction variant="destructive">
            Cancelar consulta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
