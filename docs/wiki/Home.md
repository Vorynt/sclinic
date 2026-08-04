# sclinic — Documentação do sistema

Handbook oficial do produto e da engenharia. Público-alvo: **qualquer novo colaborador** (produto, engenharia, design, QA, ops).

> Fonte versionada no repositório: `docs/wiki/`. Publicação remota: GitHub Wiki (`npm run docs:wiki:sync`).

## Comece por aqui

1. [Onboarding do colaborador](Onboarding-do-Colaborador)
2. [Visão do produto](Visao-do-Produto)
3. [Requisitos](Requisitos) (RF, RNF, personas)
4. [Arquitetura](Arquitetura)
5. [Módulos e boundaries](Modulos-e-Boundaries)
6. [Catálogo de features](Catalogo-de-Features) · [Épicos](Epicos) · [Roadmap](Roadmap)

## Mapa da documentação

| Seção | Páginas |
|-------|---------|
| **Produto** | [Visão](Visao-do-Produto), [Requisitos](Requisitos), [Glossário](Glossario), [Roadmap](Roadmap), [Épicos](Epicos), [Features](Catalogo-de-Features) |
| **Arquitetura** | [Arquitetura](Arquitetura), [Módulos](Modulos-e-Boundaries), [Rotas](Rotas-e-Navegacao), [RBAC](RBAC-e-Permissoes), [Diagramas](Diagramas) |
| **Domínio** | Auth, Clínicas, Equipe, Pacientes, Profissionais, Agenda, Prontuário, Recepção, Faturamento, SaaS, Auditoria, Dashboard/Settings, Ajuda, Marketing |
| **Decisões** | [Índice de decisões](Indice-de-Decisoes) → ADRs em `docs/adr/` |
| **Operação** | [Ambientes](Ambientes-e-Operacao), [Manutenção da doc](Manutencao-da-Documentacao) |

## Princípios desta wiki

- Descreve o **sistema como está** (código + ADRs), não desejos não rastreados.
- Roadmap/épicos/features foram **derivados** do implementado; backlog futuro está priorizado em H1–H3 + *Next* técnico (*planned* / *deferred*).
- Decisões canônicas vivem em `docs/adr/`; aqui há resumo + link.
- Regras de código em `architecture/`; aqui há visão para humanos.

## Stack (resumo)

Next.js 16 · React 19 · Drizzle · Neon · Better Auth · TanStack Query · Stripe · Tailwind v4 / shadcn

---

*Base documentada em 2026-07-28 a partir do código e dos ADRs 001–006. Manter via skill `system-docs-sync`.*
