import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { theme } from '@/config/theme';

const meta = {
  title: 'Foundation/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Paleta de cores do sclinic. Valores definidos em oklch via CSS variables em globals.css.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function ColorSwatch({ token }: { token: string }) {
  const tailwindClass = `bg-${token}`;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-20 w-full rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className="space-y-0.5">
        <p className="font-mono text-sm font-medium">{token}</p>
        <p className="font-mono text-xs text-muted-foreground">--{token}</p>
        <p className="font-mono text-xs text-muted-foreground">{tailwindClass}</p>
      </div>
    </div>
  );
}

function ColorGrid({ tokens }: { tokens: readonly string[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {tokens.map((token) => (
        <ColorSwatch key={token} token={token} />
      ))}
    </div>
  );
}

export const Semantic: Story = {
  render: () => <ColorGrid tokens={theme.colors.semantic} />,
  parameters: {
    docs: {
      description: {
        story:
          'Tokens semânticos para superfícies, texto, ações e estados. Use classes como `bg-primary` e `text-muted-foreground`.',
      },
    },
  },
};

export const Chart: Story = {
  render: () => <ColorGrid tokens={theme.colors.chart} />,
  parameters: {
    docs: {
      description: {
        story:
          'Cores para gráficos e visualizações de dados. Disponíveis como `bg-chart-1` … `bg-chart-5`.',
      },
    },
  },
};

export const Sidebar: Story = {
  render: () => <ColorGrid tokens={theme.colors.sidebar} />,
  parameters: {
    docs: {
      description: {
        story:
          'Tokens específicos da sidebar de navegação. Prefixo `sidebar-*` mapeado no tema Tailwind.',
      },
    },
  },
};
