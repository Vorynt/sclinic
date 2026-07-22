import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";

import { ThemeProvider } from "@/providers/ThemeProvider";

import { Button } from "./button";
import { Toaster } from "./sonner";

const meta = {
  title: "Molecules/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}>
        <Story />
        <Toaster richColors />
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Sistema de notificações toast baseado em Sonner, integrado ao tema da aplicação.",
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button onClick={() => toast("Evento agendado com sucesso.")}>
      Mostrar toast
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Toast padrão disparado por clique no botão.",
      },
    },
  },
};

export const Success: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.success("Paciente cadastrado!", {
          description: "Os dados foram salvos no sistema.",
        })
      }>
      Toast de sucesso
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Toast de sucesso com título e descrição.",
      },
    },
  },
};

export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() =>
        toast.error("Falha ao salvar", {
          description: "Verifique os campos obrigatórios e tente novamente.",
        })
      }>
      Toast de erro
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Toast de erro para feedback de falha na operação.",
      },
    },
  },
};

export const WithPromise: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.promise(
          new Promise<string>((resolve) =>
            setTimeout(() => resolve("Consulta confirmada"), 2000),
          ),
          {
            loading: "Agendando consulta...",
            success: (data: string) => data,
            error: "Erro ao agendar consulta.",
          },
        )
      }>
      Toast com promise
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Toast assíncrono que exibe loading, sucesso ou erro conforme o resultado da promise.",
      },
    },
  },
};
