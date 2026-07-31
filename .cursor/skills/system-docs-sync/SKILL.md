---
name: system-docs-sync
description: >-
  Updates sclinic system handbook in docs/wiki/ (product + architecture + domain
  + roadmap/epics/features + decisions) whenever a feature, business rule, schema,
  route, RBAC permission, status machine, ADR, or user-visible flow changes. Use
  after implementing features, accepting ADRs, changing permissions/seeds, updating
  roadmap, or when the user mentions documentação, wiki, handbook, épicos, roadmap,
  ou sync da wiki.
---

# System docs sync (sclinic)

Toda entrega com comportamento observável ou decisão de produto/arquitetura **deve** atualizar o handbook em `docs/wiki/` antes de considerar o trabalho pronto.

## Fonte da verdade

| Artefato | Path |
|----------|------|
| Handbook | `docs/wiki/*.md` |
| Sidebar | `docs/wiki/_Sidebar.md` |
| Sync | `npm run docs:wiki:sync` → `scripts/sync-wiki.sh` |
| ADRs | `docs/adr/` |
| Arquitetura normativa | `architecture/` |
| Notebooks | `.notebook/` |

**Nunca** edite só a wiki remota: edite `docs/wiki/` e sincronize.

## Quando disparar (obrigatório)

- Nova feature ou mudança de fluxo/UI/gate
- Regra de negócio, schema Zod, máquina de status
- RBAC / papéis / nav
- Rota nova/removida (`src/config/routes.ts`)
- ADR novo ou revisado
- Item de roadmap/épico muda de status
- Módulo deferred passa a existir

Não atualizar por: refactor interno sem mudança observável; só tipagem; polish visual sem novo fluxo.

## Workflow

1. Identificar impacto → páginas em `docs/wiki/` (tabela abaixo).
2. Ler página atual + ADR/notebook relacionado.
3. Atualizar domínio + `docs/wiki/Catalogo-de-Features.md` se feature mudou.
4. Atualizar `docs/wiki/Epicos.md` / `docs/wiki/Roadmap.md` se status mudou.
5. Novo ADR → `docs/wiki/Indice-de-Decisoes.md` + página de domínio.
6. Fluxo estrutural → `docs/wiki/Diagramas.md`.
7. Página nova → link em `Home.md` e `_Sidebar.md`.
8. Oferecer `npm run docs:wiki:sync`.
9. Responder em português (1–3 bullets do que mudou na doc).

## Mapa página ↔ tema

| Tema | Página |
|------|--------|
| Onboarding colaboradores | `Onboarding-do-Colaborador.md` |
| Produto | `Visao-do-Produto.md`, `Requisitos.md`, `Glossario.md` |
| Planejamento | `Roadmap.md`, `Epicos.md`, `Catalogo-de-Features.md` |
| Arquitetura | `Arquitetura.md`, `Modulos-e-Boundaries.md`, `Rotas-e-Navegacao.md`, `RBAC-e-Permissoes.md`, `Diagramas.md` |
| authentication | `Dominio-Autenticacao.md` |
| clinics | `Dominio-Clinicas.md` |
| users | `Dominio-Usuarios-e-Equipe.md` |
| patients | `Dominio-Pacientes.md` |
| professionals | `Dominio-Profissionais.md` |
| appointments | `Dominio-Agendamentos.md` |
| medical-records | `Dominio-Prontuario.md` |
| reception / SSE | `Dominio-Recepcao-e-Realtime.md` |
| billing clinical | `Dominio-Faturamento-Clinico.md` |
| billing SaaS | `Dominio-Assinatura-SaaS.md` |
| audit | `Dominio-Auditoria.md` |
| dashboard / settings | `Dominio-Dashboard-e-Settings.md` |
| marketing | `Dominio-Marketing.md` |
| help | `Dominio-Ajuda.md` |
| decisões | `Indice-de-Decisoes.md` |
| ops | `Ambientes-e-Operacao.md`, `Manutencao-da-Documentacao.md` |

## Template — página de domínio

```markdown
# Domínio — <Nome>

**Módulo:** `src/modules/<feature>/` · **Épico:** Ex · **ADR:** …

## Responsabilidade / Features
## Regras de negócio
## Schema (quando relevante)
## Decisões relacionadas
## Arquivos-chave
```

## Template — feature no catálogo

`| Feature | Status (Done/Partial/Planned/Deferred) | Onde |`

## Checklist “pronto”

- [ ] Domínio / catálogo atualizados
- [ ] Roadmap/épicos se status mudou
- [ ] ADR linkado se houve decisão
- [ ] Diagrama se fluxo mudou
- [ ] Wiki sync oferecido

## Anti-padrões

- Inventar roadmap sem base em código/ADR
- Documentar só para QA (esta wiki é handbook geral)
- Duplicar ADR inteiro (resumir + link)
- Atualizar só o remoto
