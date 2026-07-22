import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { theme } from '@/config/theme';

const meta = {
  title: 'Foundation/Spacing',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Escala de espaçamento Tailwind. Cada unidade = 0.25rem (4px por padrão).',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function formatSpacingClass(value: number): string {
  return value === 0 ? 'p-0' : `p-${value}`;
}

export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="mb-4 text-sm text-muted-foreground">
        Unidade base: <span className="font-mono">{theme.spacing.unit}</span>{' '}
        — largura da barra = valor × {theme.spacing.unit}
      </p>

      {theme.spacing.scale.map((value) => {
        const widthRem = value * 0.25;

        return (
          <div key={value} className="flex items-center gap-4">
            <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
              {formatSpacingClass(value)}
            </span>
            <div
              className="h-6 rounded-sm bg-primary"
              style={{ width: `${widthRem}rem` }}
            />
            <span className="font-mono text-xs text-muted-foreground">
              {widthRem}rem
            </span>
          </div>
        );
      })}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Escala usada por `p-*`, `m-*`, `gap-*` e utilitários de spacing. Valores fracionários (0.5, 1.5, …) seguem a convenção Tailwind.',
      },
    },
  },
};
