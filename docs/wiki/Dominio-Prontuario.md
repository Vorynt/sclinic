# Domínio — Prontuário e receitas

**Módulo:** `src/modules/medical-records/` · **Épicos:** E5, E13 · **ADR-005** · **ADR-008** · **ADR-010**

## Sumário

- [Responsabilidade](#responsabilidade)
- [Clinical notes](#clinical-notes)
- [Vital signs](#vital-signs)
- [Clinical alerts](#clinical-alerts)
- [Prescriptions](#prescriptions-adr-005--adr-008--adr-010)

## Responsabilidade

Não há rota top-level: vive no attendance e no detalhe do paciente. Workspace e seções clínicas exigem `records.read` — recepcionista não entra.

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
- **Shipado:** receita, declaração de comparecimento, atestado médico e solicitação de exames
- **Declaração:** `notes` opcional em `metadata`; corpo gerado no service; system layout próprio
- **Atestado:** `daysOff` (obrig.), `cid` e `notes` opcionais; corpo gerado; system layout
- **Solicitação de exames:** `exams[]` (lista, mín. 1) + `notes` (indicação clínica opcional); corpo gerado; system layout
- **H2 (avaliar depois):** atestado de acompanhamento, relatório/encaminhamento — novos `kind`s + metadata
- Print: HTML + `@media print` (sem PDF); rota `/prescriptions/:id/print`
- Templates de timbrado (ADR-008): até **3** por clínica — só para `kind = prescription`
- UI attendance: seção **Documentos** (`/attendance/documents`); legado `/prescriptions` redireciona
- Paciente: histórico em `/patients/:id/documents`

## Decisões relacionadas

Entidade própria na tabela `prescriptions` (nome físico mantido; produto fala “Documentos”). Designer isolado no módulo; domínio clínico consome HTML/`layoutId`. Extensões: PDF, assinatura, layouts custom por kind — ver ADR-005/008/010 e [Roadmap](Roadmap).

Ver [Índice de decisões](Indice-de-Decisoes) · `docs/adr/010-clinical-document-kinds.md`.

## Ver também

- [Pacientes](Dominio-Pacientes)
- [Agendamentos](Dominio-Agendamentos)
- [Dashboard e settings](Dominio-Dashboard-e-Settings)
- [Roadmap](Roadmap)
- [Índice de decisões](Indice-de-Decisoes)
