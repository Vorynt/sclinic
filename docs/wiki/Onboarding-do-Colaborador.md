# Onboarding do colaborador

Guia de primeiros dias no sclinic.

## 1. Contexto (30–60 min)

1. Ler [Visão do produto](Visao-do-Produto) e [Glossário](Glossario).
2. Ler [Arquitetura](Arquitetura) e [Módulos e boundaries](Modulos-e-Boundaries).
3. Skim dos ADRs em `docs/adr/` (ou [Índice de decisões](Indice-de-Decisoes)).
4. Ver [Catálogo de features](Catalogo-de-Features) + [Roadmap](Roadmap).

## 2. Ambiente local

```bash
npm install
cp .env.example .env.local   # preencher secrets
npm run db:migrate           # ou db:push, conforme o time
npm run db:seed:rbac
npm run db:seed:plans
npm run dev
```

Detalhes: [Ambientes e operação](Ambientes-e-Operacao).

## 3. Mapa do repositório

| Path | O quê |
|------|--------|
| `src/modules/<feature>/` | Domínio (referência: `patients`) |
| `src/app/` | Rotas Next (App Router) |
| `src/db/` | Schema Drizzle + migrations + seeds |
| `src/core/` | Auth session, events, realtime, logger… |
| `src/shared/` | api, errors, validators, auth helpers |
| `architecture/` | Regras obrigatórias de código |
| `docs/adr/` | Decisões arquiteturais |
| `docs/wiki/` | **Esta documentação** |
| `.notebook/` | Notas curtas de implementação |

## 4. Fluxo de código (não negociável)

```
Page → Server Action → Service → Repository → Drizzle
```

Ver `AGENTS.md` e `architecture/`.

## 5. Primeira contribuição

1. Pegar uma feature no [Catálogo](Catalogo-de-Features) / issue.
2. Espelhar `src/modules/patients/`.
3. Ordem: schema/DTO → repository → service → action → queries/mutations → UI → page.
4. Atualizar `docs/wiki/` (skill `system-docs-sync`) se o comportamento for observável.
5. Testes de domínio em `modules/<feature>/tests/` quando houver lógica.

## 6. Contatos mentais

| Dúvida | Onde |
|--------|------|
| “Posso importar X de outro módulo?” | `architecture/003-import-rules.md` |
| “Onde fica a regra de negócio?” | Service do módulo |
| “Por que foi feito assim?” | ADR + página de domínio |
| “O que vem depois?” | [Roadmap](Roadmap) |
