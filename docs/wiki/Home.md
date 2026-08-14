# sclinic — Documentação do sistema

Handbook oficial do produto e da engenharia. Público-alvo: **qualquer novo colaborador** (produto, engenharia, design, QA, ops).

> Fonte versionada no repositório: `docs/wiki/`. Publicação remota: GitHub Wiki (`npm run docs:wiki:sync`).

## Comece por aqui

**Colaborador novo** — [Onboarding do colaborador](Onboarding-do-Colaborador)

**Produto** — [Visão do produto](Visao-do-Produto) · [Requisitos](Requisitos) (RF, RNF, personas)

**Engenharia** — [Arquitetura](Arquitetura) · [Módulos e boundaries](Modulos-e-Boundaries)

**Planejamento** — [Catálogo de features](Catalogo-de-Features) · [Épicos](Epicos) · [Roadmap](Roadmap)

## Mapa da documentação

**Produto** — [Visão](Visao-do-Produto) · [Requisitos](Requisitos) · [Glossário](Glossario) · [Roadmap](Roadmap) · [Épicos](Epicos) · [Features](Catalogo-de-Features)

**Arquitetura** — [Arquitetura](Arquitetura) · [Módulos](Modulos-e-Boundaries) · [Rotas](Rotas-e-Navegacao) · [RBAC](RBAC-e-Permissoes) · [Diagramas](Diagramas)

**Domínio**
- *Plataforma:* [Autenticação](Dominio-Autenticacao) · [Clínicas](Dominio-Clinicas) · [Usuários e equipe](Dominio-Usuarios-e-Equipe) · [Dashboard e settings](Dominio-Dashboard-e-Settings) · [Auditoria](Dominio-Auditoria) · [Ajuda](Dominio-Ajuda) · [Marketing](Dominio-Marketing)
- *Assistência:* [Pacientes](Dominio-Pacientes) · [Profissionais](Dominio-Profissionais) · [Agendamentos](Dominio-Agendamentos) · [Prontuário](Dominio-Prontuario) · [Recepção](Dominio-Recepcao-e-Realtime)
- *Financeiro:* [Faturamento clínico](Dominio-Faturamento-Clinico) · [Assinatura SaaS](Dominio-Assinatura-SaaS)

**Decisões** — [Índice de decisões](Indice-de-Decisoes) → ADRs em `docs/adr/`

**Operação** — [Ambientes](Ambientes-e-Operacao) · [Manutenção da doc](Manutencao-da-Documentacao)

## Princípios desta wiki

- Descreve o **sistema como está** (código + ADRs), não desejos não rastreados.
- Roadmap/épicos/features foram **derivados** do implementado; backlog futuro está priorizado em H1–H3 + *Next* técnico (*planned* / *deferred*).
- Decisões canônicas vivem em `docs/adr/`; aqui há resumo + link.
- Regras de código em `architecture/`; aqui há visão para humanos.

## Stack (resumo)

Next.js 16 · React 19 · Drizzle · Neon · Better Auth · TanStack Query · Stripe · Tailwind v4 / shadcn · Jest

---

*Base documentada em 2026-07-28 a partir do código e dos ADRs 001–006. Manter via skill `system-docs-sync`.*
