# ADR-014: Anexos clínicos (GED) — trilha separada de documentos emitidos

- **Date**: 2026-08-17
- **Status**: Accepted (direção; implementação Later)
- **Deciders**: Time sclinic
- **Tags**: architecture, medical-records, storage, attachments, ged
- **Related**: ADR-004 (cotas storage), ADR-010 (documentos clínicos emitíveis)

## Context and Problem Statement

Clínicas precisam armazenar arquivos que **não são emitidos pelo médico** no atendimento: PDFs de exames, laudos externos, fotos clínicas, autorizações de convênio, documentos de identidade digitalizados.

O pipeline ADR-010 (`prescriptions` + `kind` + draft→issued→print) cobre **documentos emitíveis** com freeze de timbrado. Anexos têm ciclo de vida diferente (upload → armazenamento → visualização) e exigem blob/S3 + cotas de plano ([ADR-004](004-plan-entitlements.md)).

## Decision Outcome

**Não** estender `prescriptions.kind` para uploads. Reservar trilha **`clinical_attachments`** (nome provisório) no módulo `medical-records` ou subpasta dedicada, acoplada à trilha de storage do roadmap.

### Regras

| Tema | Decisão |
|------|--------|
| Documentos emitidos | Continuam em `prescriptions` + `kind` (ADR-010) |
| Anexos / GED | Entidade separada; upload por paciente (e opcionalmente por appointment) |
| Storage | Blob provider + `assertPlanCapacity(..., "storage")` (ADR-004) |
| Permissões | `records.read` / `records.write` (mesmo gate do prontuário) |
| Horizonte | **Later** — fora do backlog H1–H3 de produto atual |

### Fora deste ADR

Implementação de upload, preview, virus scan, OCR, portal do paciente para anexos.

## Positive Consequences

- Separação clara entre “documento médico emitido” (imutável, print) e “arquivo anexado” (upload)
- Evita poluir `metadata` jsonb de prescriptions com referências a blob
- Cotas de storage aplicadas no lugar certo

## Negative Consequences

- Dois conceitos de “documento” na UI do paciente até integração visual na ficha
- Exige ADR de implementação + provider de blob antes do código

## Links

- [ADR-010 — Documentos clínicos tipados](./010-clinical-document-kinds.md)
- [Roadmap H3+ · upload](../wiki/Roadmap.md)
- [Catálogo E13](../wiki/Catalogo-de-Features.md)
