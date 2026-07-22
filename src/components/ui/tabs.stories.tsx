import { CalendarBlankIcon, GearIcon, UserIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Navegação por abas para alternar entre seções de conteúdo relacionadas, com suporte a orientação horizontal e vertical.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Três abas com conteúdo independente e valor inicial selecionado.",
      },
    },
  },
  render: () => (
    <Tabs defaultValue="agenda" className="w-100">
      <TabsList>
        <TabsTrigger value="agenda">Agenda</TabsTrigger>
        <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
        <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
      </TabsList>
      <TabsContent value="agenda">
        <p className="text-muted-foreground text-sm">
          Visualize consultas do dia, confirmações pendentes e horários
          disponíveis.
        </p>
      </TabsContent>
      <TabsContent value="pacientes">
        <p className="text-muted-foreground text-sm">
          Busque pacientes, acesse prontuários e histórico de atendimentos.
        </p>
      </TabsContent>
      <TabsContent value="relatorios">
        <p className="text-muted-foreground text-sm">
          Acompanhe indicadores de ocupação, faturamento e produtividade da
          clínica.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Abas em orientação vertical, com lista lateral e conteúdo à direita.",
      },
    },
  },
  render: () => (
    <Tabs
      defaultValue="agenda"
      orientation="vertical"
      className="flex w-100 gap-4">
      <TabsList>
        <TabsTrigger value="agenda">Agenda</TabsTrigger>
        <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
        <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
      </TabsList>
      <TabsContent value="agenda">
        <p className="text-muted-foreground text-sm">
          Visualize consultas do dia, confirmações pendentes e horários
          disponíveis.
        </p>
      </TabsContent>
      <TabsContent value="pacientes">
        <p className="text-muted-foreground text-sm">
          Busque pacientes, acesse prontuários e histórico de atendimentos.
        </p>
      </TabsContent>
      <TabsContent value="relatorios">
        <p className="text-muted-foreground text-sm">
          Acompanhe indicadores de ocupação, faturamento e produtividade da
          clínica.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: "Gatilhos de aba com ícones Phosphor para reforço visual.",
      },
    },
  },
  render: () => (
    <Tabs defaultValue="perfil" className="w-100">
      <TabsList>
        <TabsTrigger value="perfil">
          <UserIcon />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="agenda">
          <CalendarBlankIcon />
          Agenda
        </TabsTrigger>
        <TabsTrigger value="configuracoes">
          <GearIcon />
          Configurações
        </TabsTrigger>
      </TabsList>
      <TabsContent value="perfil">
        <p className="text-muted-foreground text-sm">
          Dados pessoais, foto e preferências de notificação.
        </p>
      </TabsContent>
      <TabsContent value="agenda">
        <p className="text-muted-foreground text-sm">
          Horários de atendimento e bloqueios de agenda.
        </p>
      </TabsContent>
      <TabsContent value="configuracoes">
        <p className="text-muted-foreground text-sm">
          Preferências da clínica, integrações e permissões de acesso.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
