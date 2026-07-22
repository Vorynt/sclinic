import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const sizes = ["default", "sm"] as const;

const meta = {
  title: "Atoms/Card",
  component: Card,
  args: {
    size: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: [...sizes],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Container flexível para agrupar conteúdo com cabeçalho, corpo, rodapé e ação opcional.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Composição completa com cabeçalho, conteúdo e rodapé com botão de ação.",
      },
    },
  },
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Próxima consulta</CardTitle>
        <CardDescription>Paciente: Maria Silva — amanhã às 10h</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Consulta de retorno com avaliação de exames laboratoriais.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Reagendar</Button>
        <Button>Confirmar</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Variante compacta (size=\"sm\") com espaçamento reduzido para listas densas.",
      },
    },
  },
  render: () => (
    <Card size="sm" className="max-w-sm">
      <CardHeader>
        <CardTitle>Resumo do dia</CardTitle>
        <CardDescription>12 consultas agendadas</CardDescription>
      </CardHeader>
      <CardContent>
        <p>3 confirmações pendentes e 1 cancelamento.</p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Cabeçalho com CardAction para botões ou controles alinhados à direita.",
      },
    },
  },
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Plano de tratamento</CardTitle>
        <CardDescription>Última atualização há 2 dias</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Fisioterapia 2x por semana por 4 semanas.</p>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Uso mínimo com apenas CardContent, ideal para blocos de texto isolados.",
      },
    },
  },
  render: () => (
    <Card className="max-w-sm">
      <CardContent>
        <p>
          Este card contém apenas conteúdo textual, sem cabeçalho ou rodapé.
        </p>
      </CardContent>
    </Card>
  ),
};
