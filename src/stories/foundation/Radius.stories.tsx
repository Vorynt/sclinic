import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { theme } from '@/config/theme';

const meta = {
  title: 'Foundation/Radius',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Escala de border-radius derivada de `--radius`. Use classes `rounded-*` do Tailwind.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const radiusTokens = [
  { name: 'sm', className: 'rounded-sm', cssVar: '--radius-sm' },
  { name: 'md', className: 'rounded-md', cssVar: '--radius-md' },
  { name: 'lg', className: 'rounded-lg', cssVar: '--radius-lg' },
  { name: 'xl', className: 'rounded-xl', cssVar: '--radius-xl' },
  { name: '2xl', className: 'rounded-2xl', cssVar: '--radius-2xl' },
  { name: '3xl', className: 'rounded-3xl', cssVar: '--radius-3xl' },
  { name: '4xl', className: 'rounded-4xl', cssVar: '--radius-4xl' },
] as const;

export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="font-mono text-sm">
          Base: <span className="font-semibold">--radius</span> ={' '}
          {theme.radius.base}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Demais tokens são múltiplos calculados a partir dessa base.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {radiusTokens.map((token) => (
          <div key={token.name} className="flex flex-col items-center gap-3">
            <div
              className={`${token.className} h-24 w-24 border-2 border-primary bg-primary/20`}
            />
            <div className="space-y-0.5 text-center">
              <p className="font-mono text-sm font-medium">{token.className}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {token.cssVar}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {theme.radius.scale[token.name]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Visualização da escala de radius. Alterne o tema para verificar contraste em light/dark.',
      },
    },
  },
};
