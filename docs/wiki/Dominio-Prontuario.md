# Domínio — Prontuário e receitas

**Módulo:** `src/modules/medical-records/` · **Épico:** E5 · **ADR-005**

## Escopo

Não há rota top-level: vive no attendance e no detalhe do paciente.

## Clinical notes

- 1 nota por appointment (upsert)
- Editável só com appointment `checked_in`
- Templates: blank, first_visit, follow_up, soap, procedure
- Perms: `records.read` / `records.write`

## Vital signs

- 1 registro por appointment; mesmo gate `checked_in`
- Ranges clínicos no schema; IMC **derivado** (não persistido)

## Clinical alerts

- Escopo paciente (não appointment)
- Kinds: allergy, restriction, attention, other
- Severity: low | medium | high

## Prescriptions (ADR-005)

| Status | Comportamento |
|--------|----------------|
| `draft` | Editável em `checked_in` |
| `issued` | Imutável; congela layoutHtml + snapshots |

- 0..N por appointment
- Print: HTML + `@media print` (sem PDF)
- Layout: default no código ou custom em `/settings/prescriptions`

## Decisão

Entidade própria (não embutir em clinical_notes). Extensões futuras: tipos/`kind`, PDF — ver ADR-005 e [Roadmap](Roadmap).
