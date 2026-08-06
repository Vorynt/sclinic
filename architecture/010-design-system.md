# 010 — Design System

## Stack

- Tailwind CSS v4
- shadcn/ui
- Tokens em `config/theme.ts` + CSS variables em `src/app/globals.css`
- Componentes base em `src/components/`
- Storybook (`.storybook/`) — toda UI nasce primeiro nele

## Identidade visual (produto autenticado)

- Neutros tintados na hue do **primary** (~242) — evita P&B seco sem perder contraste clínico.
- Chrome do app (`AppShell`): utilitário estático `bg-app-wash` (radial primary leve). Sem orbs/grid animados no conteúdo operacional.
- Headers de página: `src/components/layout/PageHeader.tsx` (alinhar skeleton em `PageHeaderSkeleton`).
- Auth / landing / loading podem ser mais expressivos (orbs, grid); o app do dia a dia fica **equilibrado**.

## Superfícies quietas (sem ornamento)

- Atendimento (`AttendanceShell`), prontuário, forms densos, settings e print: só herdam tokens.
- Proibido nessas superfícies: wash forte, orbs, grid decorativo, cards sem necessidade de interação.

## Regras

- Componentes de domínio (`PatientCard`) ficam no módulo.
- Componentes genéricos (`Button`, `Input`, `Dialog`, `PageHeader`) ficam em `src/components/`.
- Sem cards/wrappers sem necessidade de interação (seguir identidade visual do produto).
- Tema e tokens centralizados — evitar hex soltos nos módulos.
- Badges de status: preferir variants `success` / `warning` / `info` / `destructive` em `badge.tsx`.
