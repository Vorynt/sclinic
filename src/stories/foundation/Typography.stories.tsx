import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { theme } from '@/config/theme';

const meta = {
  title: 'Foundation/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Famílias tipográficas, escala de tamanhos e pesos do sclinic Design System.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const sampleText =
  'Sclinic — gestão clínica moderna. The quick brown fox jumps over the lazy dog.';

export const FontFamilies: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {Object.entries(theme.fonts).map(([key, font]) => {
        const className =
          key === 'sans'
            ? 'font-sans'
            : key === 'heading'
              ? 'font-heading'
              : 'font-mono';

        return (
          <div key={key} className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">
              {className} · {font.cssVar} · {font.family}
            </p>
            <p className={`${className} text-2xl`}>{sampleText}</p>
            <p className="text-sm text-muted-foreground">{font.usage}</p>
          </div>
        );
      })}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Três famílias: Inter (corpo), Space Grotesk (headings) e Geist Mono (código).',
      },
    },
  },
};

export const SizeScale: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {theme.typography.sizes.map((size) => (
        <div
          key={size.name}
          className="flex flex-col gap-1 border-b border-border pb-4 last:border-0"
        >
          <p className="font-mono text-xs text-muted-foreground">
            {size.className} · {size.size} / {size.lineHeight}
          </p>
          <p className={size.className}>
            {size.name.toUpperCase()} — {sampleText}
          </p>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Escala de tamanhos de texto de `text-xs` a `text-4xl`.',
      },
    },
  },
};

export const WeightScale: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {theme.typography.weights.map((weight) => (
        <div key={weight.name} className="flex items-baseline gap-4">
          <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
            {weight.className} ({weight.value})
          </span>
          <p className={`text-lg ${weight.className}`}>{sampleText}</p>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pesos disponíveis: normal, medium, semibold e bold.',
      },
    },
  },
};
