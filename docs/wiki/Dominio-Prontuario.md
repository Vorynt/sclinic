# Domínio — Prontuário e receitas

**Módulo:** `src/modules/medical-records/` · **Épico:** E5 · **ADR-005** · **ADR-008**

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

## Prescriptions (ADR-005 + ADR-008)

| Status | Comportamento |
|--------|----------------|
| `draft` | Editável em `checked_in`; guarda `layoutId` do template escolhido |
| `issued` | Imutável; congela `layoutHtml` + snapshots |

- 0..N por appointment
- Print: HTML + `@media print` (sem PDF)
- Templates: até **3** por clínica (nomeados, um `isDefault`); escolha na criação da receita
- Fonte do timbrado: **DocumentModel** (blocos empilhados) → HTML compilado; pacote `prescription-template-designer/`
- Sem templates custom → default do sistema
- Settings: `/settings/prescriptions` (designer de blocos; `settings.manage`)

## Decisão

Entidade própria (não embutir em clinical_notes). Designer isolado no módulo; domínio clínico consome HTML/`layoutId`. Extensões futuras: tipos/`kind`, PDF, posição livre — ver ADR-005/008 e [Roadmap](Roadmap).
