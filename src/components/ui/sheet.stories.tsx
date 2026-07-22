import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import { Field, FieldGroup, FieldLabel } from "./field";
import { Input } from "./input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  title: "Molecules/Sheet",
  component: Sheet,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Painel lateral deslizante para navegação, filtros ou formulários contextuais, com suporte a múltiplos lados.",
      },
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Sheet padrão deslizando pela direita com título e descrição.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Detalhes do paciente</SheetTitle>
          <SheetDescription>
            Visualize e edite informações complementares do paciente selecionado.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 text-sm text-muted-foreground">
          Conteúdo principal do painel lateral.
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  parameters: {
    docs: {
      description: {
        story: "Sheet deslizando pela esquerda, comum para menus de navegação.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir à esquerda</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navegação secundária e atalhos da aplicação.
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-4 text-sm">
          <span>Pacientes</span>
          <span>Consultas</span>
          <span>Configurações</span>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Sheet deslizando por baixo, útil para ações mobile ou painéis compactos.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir por baixo</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Ações rápidas</SheetTitle>
          <SheetDescription>
            Escolha uma ação para o registro selecionado.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          <Button variant="outline" size="sm">
            Reagendar
          </Button>
          <Button variant="outline" size="sm">
            Enviar lembrete
          </Button>
          <Button variant="destructive" size="sm">
            Cancelar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Sheet com formulário de campos e botões de ação no rodapé.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Filtrar pacientes</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Refine a listagem de pacientes com os critérios abaixo.
          </SheetDescription>
        </SheetHeader>
        <FieldGroup className="px-4">
          <Field>
            <FieldLabel htmlFor="sheet-filter-name">Nome</FieldLabel>
            <Input id="sheet-filter-name" placeholder="Buscar por nome" />
          </Field>
          <Field>
            <FieldLabel htmlFor="sheet-filter-email">E-mail</FieldLabel>
            <Input
              id="sheet-filter-email"
              type="email"
              placeholder="Buscar por e-mail"
            />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Limpar</Button>
          </SheetClose>
          <Button>Aplicar filtros</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
