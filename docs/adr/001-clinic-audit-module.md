# ADR-001: Módulo de auditoria da clínica

- **Date**: 2026-07-24
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, security, audit, events

## Context and Problem Statement

Precisamos de trilha de auditoria por clínica (sucesso/erro, o que mudou, quem, quando), disparada automaticamente pelas mutações da API, com leitura restrita a owner e admin. Hoje só existem colunas `createdBy`/`updatedBy`, sem histórico append-only nem bus de eventos.

## Decision Drivers

- Respeitar o fluxo Action → Service → Repository
- Não acoplar todos os módulos ao repository de audit
- Escopo multi-tenant com RLS por `clinicId`
- UI de consulta em Settings, só para papéis privilegiados

## Considered Options

- Subdomínio dentro de `clinics` / `settings`
- Módulo novo `audit` + chamada explícita nos services
- Módulo novo `audit` + pub/sub em `core/events`

## Decision Outcome

Chosen option: **"Módulo `audit` + eventos em `core/events`"**, because desacopla a escrita, alinha com `architecture/003` e escala para instrumentar patients, appointments, clinics e equipe.

### Positive Consequences

- Histórico append-only consultável por owner/admin
- Services emitem `audit.record` sem conhecer Drizzle de audit
- Permissão dedicada `audit.read` (não reutilizar `settings.manage`)

### Negative Consequences

- Exige registrar o subscriber (via helper público `recordAudit`)
- Instrumentação manual em cada mutator (aceito no estágio atual)

## Links

- `architecture/001-feature-based.md`
- `architecture/003-import-rules.md`
