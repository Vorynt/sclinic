# Domínio — Prontuário e receitas

**Módulo:** `src/modules/medical-records/` · **Épicos:** E5, E13 · **ADR-005** · **ADR-008** · **ADR-010**

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

## Prescriptions (ADR-005 + ADR-008 + ADR-010)

| Status | Comportamento |
|--------|----------------|
| `draft` | Editável em `checked_in`; receita guarda `layoutId` do template escolhido |
| `issued` | Imutável; congela `layoutHtml` + snapshots |

- 0..N por appointment; tipados por `kind` (ADR-010)
- Kinds: `prescription` \| `attendance_declaration` \| `medical_certificate` \| `exam_request`
- **Shipado:** receita + declaração de comparecimento (`notes` opcional em `metadata`; corpo gerado no service; system layout próprio)
- **Enum pronto, UI depois:** atestado, solicitação de exames
- Print: HTML + `@media print` (sem PDF); rota `/prescriptions/:id/print`
- Templates de timbrado (ADR-008): até **3** por clínica — só para `kind = prescription`
- UI attendance: seção **Documentos** (`/attendance/documents`); legado `/prescriptions` redireciona
- Paciente: histórico em `/patients/:id/documents`

## Decisão

Entidade própria na tabela `prescriptions` (nome físico mantido; produto fala “Documentos”). Designer isolado no módulo; domínio clínico consome HTML/`layoutId`. Extensões: PDF, assinatura, layouts custom por kind — ver ADR-005/008/010 e [Roadmap](Roadmap).

## ADR-010

Ver [Índice de decisões](Indice-de-Decisoes) · `docs/adr/010-clinical-document-kinds.md`.

