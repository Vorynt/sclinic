import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const patients = [
  {
    name: "Maria Silva",
    email: "maria.silva@email.com",
    status: "Ativo",
    variant: "default" as const,
  },
  {
    name: "João Santos",
    email: "joao.santos@email.com",
    status: "Pendente",
    variant: "secondary" as const,
  },
  {
    name: "Ana Costa",
    email: "ana.costa@email.com",
    status: "Inativo",
    variant: "outline" as const,
  },
  {
    name: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    status: "Ativo",
    variant: "default" as const,
  },
  {
    name: "Carla Mendes",
    email: "carla.mendes@email.com",
    status: "Cancelado",
    variant: "destructive" as const,
  },
];

const meta = {
  title: "Molecules/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          "Tabela responsiva para listagens de dados, com suporte a cabeçalho, rodapé e legenda.",
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Lista de pacientes com nome, e-mail e status representado por Badge.",
      },
    },
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.email}>
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>
              <Badge variant={patient.variant}>{patient.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tabela com legenda descritiva abaixo do conteúdo para contexto adicional.",
      },
    },
  },
  render: () => (
    <Table>
      <TableCaption>Lista de pacientes cadastrados na clínica.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.email}>
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>
              <Badge variant={patient.variant}>{patient.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tabela com rodapé exibindo totais agregados, útil para resumos e relatórios.",
      },
    },
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Consultas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient, index) => (
          <TableRow key={patient.email}>
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>
              <Badge variant={patient.variant}>{patient.status}</Badge>
            </TableCell>
            <TableCell className="text-right">{index + 2}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total de consultas</TableCell>
          <TableCell className="text-right">18</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
