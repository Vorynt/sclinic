# Domínio — Auditoria

**Módulo:** `src/modules/audit/` · **Épico:** E8 · **ADR-001**

## Modelo

- Append-only por clínica
- Escrita via `core/events` (`recordAudit`) — services não importam repository de audit
- Leitura: `/settings/audit` com `audit.read` (owner/admin)

## O que registra

Mutações instrumentadas: patient, appointment, clinic, hours, member, invitation, charge, clinical_note, vital_signs, clinical_alert, prescription, prescription_layout, professional, …

Campos: ator, action, status success|error, entity, changes (sem secrets), erro tipado.

## Decisão

Módulo próprio + pub/sub em vez de acoplar todos os services ao audit repository. Instrumentação ainda **manual** por mutator (aceito no estágio atual).
