import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Field, FieldGroup, FieldLabel } from "./field";
import { Input } from "./input";

const meta = {
  title: "Molecules/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal sobreposto para ações, confirmações ou formulários curtos, com overlay, cabeçalho, descrição e rodapé opcionais.",
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dialog padrão aberto por um botão, com título, descrição e ações Cancelar/Salvar no rodapé.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Faça alterações no perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dialog sem botão de fechar no canto superior, útil quando o fechamento deve ser explícito via ações do rodapé.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir sem X</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Confirmação necessária</DialogTitle>
          <DialogDescription>
            Este dialog só pode ser fechado pelos botões abaixo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Form: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Dialog com formulário simples usando Field, Label e Input para cadastro ou edição de dados.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Novo paciente</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos para cadastrar um novo paciente.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="dialog-patient-name">Nome completo</FieldLabel>
            <Input id="dialog-patient-name" placeholder="Ex.: Maria Silva" />
          </Field>
          <Field>
            <FieldLabel htmlFor="dialog-patient-email">E-mail</FieldLabel>
            <Input
              id="dialog-patient-email"
              type="email"
              placeholder="Ex.: maria@email.com"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
