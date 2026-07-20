# 010 — Design System

## Stack

- Tailwind CSS v4
- shadcn/ui
- Tokens em `config/theme.ts` + CSS variables
- Componentes base em `src/components/`
- Storybook (`.storybook/`) — toda UI nasce primeiro nele

## Regras

- Componentes de domínio (`PatientCard`) ficam no módulo.
- Componentes genéricos (`Button`, `Input`, `Dialog`) ficam em `src/components/`.
- Sem cards/wrappers sem necessidade de interação (seguir identidade visual do produto).
- Tema e tokens centralizados — evitar hex soltos nos módulos.
