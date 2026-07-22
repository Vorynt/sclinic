# Storybook — sclinic Design System

Storybook **10** (`@storybook/nextjs-vite`) documenta o design system baseado em shadcn/ui (estilo `radix-nova`).

## Comandos

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # build estático
```

## Estrutura

| Pasta / título | Conteúdo |
|----------------|----------|
| `Foundation/*` | Docs vivas: cores, tipografia, radius, espaçamento |
| `Atoms/*` | Primitivos (Button, Input, Badge, …) |
| `Molecules/*` | Compostos reutilizáveis (Dialog, Field, Table, …) |
| `src/components/ui/*.stories.tsx` | Stories colocadas junto ao componente |

## Reutilização

- Moléculas **compõem** átomos (`Button`, `Input`, `Label`, `Badge`…) — não reinventar.
- Preferir `Field` para formulários; `Dialog`/`Sheet`/`AlertDialog` para overlays; `Empty` para estados vazios.
- Domínio (`PatientCard`, etc.) fica em `modules/<feature>/components/`, montado sobre esses blocos.

## Dark mode

Toolbar **Theme** (addon-themes): aplica a classe `dark` no `html`. Na app, `ThemeProvider` (`next-themes`) + `Toaster` (Sonner) no layout.

## Regras

1. UI genérica nasce aqui antes de ir para páginas/módulos.
2. Tokens: `src/config/theme.ts` + CSS vars em `src/app/globals.css`.
3. Componentes em `src/components/ui/`.
