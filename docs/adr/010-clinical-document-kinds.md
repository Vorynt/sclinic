# ADR-010: Documentos clínicos tipados (`kind`)

- **Date**: 2026-08-04
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, medical-records, prescriptions, clinical-documents, print
- **Extends**: ADR-005 (ciclo draft→issued + print HTML), ADR-008 (layouts de receita)
- **Supersedes (partial)**: ADR-005 — “Fora do MVP: atestado…” (abre tipos de documento; receita simples permanece)

## Context and Problem Statement

O atendimento precisa emitir documentos além da receita (declaração de comparecimento, atestado, solicitação de exames) com o mesmo ciclo confiável: draft → issued, freeze de timbrado/snapshots e print HTML sem storage. O ADR-005 modelou só receita simples sem coluna `kind`. Precisamos tipar documentos sem criar módulo novo nem duplicar o pipeline de emissão.

## Decision Drivers

- Continuar em `medical-records` (lista fechada de módulos)
- Fluxo Action → Service → Repository; espelhar receitas
- Mudança mínima: não renomear tabela `prescriptions` neste ciclo
- UI de produto fala “Documentos”; código reutiliza entidade existente
- Layouts custom (ADR-008) continuam só para receita no 1º ship
- Sem PDF/storage/assinatura/WhatsApp nesta fatia
- Extensível a atestado e solicitação de exames sem reescrever o ciclo

## Considered Options

- Tabelas irmãs por tipo (`attendance_declarations`, `medical_certificates`, …)
- Nova tabela `clinical_documents` + migração/rename de `prescriptions`
- Coluna `kind` (+ `metadata`) em `prescriptions` existente
- Embutir documentos na nota clínica / campos livres

## Decision Outcome

Chosen option: **`prescriptions.kind` + `metadata` jsonb**, because reusa o ciclo ADR-005/008, evita dual pipelines e mantém mudança mínima no schema/UI.

### Regras

| Tema | Decisão |
|------|--------|
| Enum `clinical_document_kind` | `prescription` \| `attendance_declaration` \| `medical_certificate` \| `exam_request` |
| Coluna | `prescriptions.kind` NOT NULL; backfill `prescription` em linhas existentes |
| Metadata | `metadata` jsonb nullable; shape por kind validado em Zod no módulo |
| Declaração (1º ship) | `notes` opcional em metadata; corpo gerado no service a partir de paciente/appointment/profissional |
| Status / print / freeze | Inalterados vs ADR-005 |
| Layouts | `prescription_layouts` obrigatórios só para `kind = prescription`; demais kinds usam **system default por kind** no código |
| Permissões | `records.read` / `records.write` |
| Tabela | Nome físico `prescriptions` permanece; rename para `clinical_documents` = Later |
| Tipos futuros | `medical_certificate` / `exam_request` no enum agora; implementação depois (H1 restante) |

### Fora deste ADR

PDF, assinatura digital, itens estruturados de medicamento, portal do paciente, upload de arquivos, WhatsApp, layouts custom por kind (além de receita).

### Positive Consequences

- Um pipeline de emissão para todos os documentos imprimíveis
- Declaração de comparecimento com baixo esforço (alto valor operacional)
- Enum já antecipa atestado/solicitação sem migration futura de kind

### Negative Consequences

- Nome da tabela/código (`prescription*`) fica semanticamente largo até um rename Later
- Layouts custom por kind ficam assimétricos até a fase seguinte
- `metadata` jsonb exige disciplina de validação por kind no Zod (sem schema SQL rígido)

## Pros and Cons of the Options

### Tabelas irmãs por tipo

- ✅ Tipagem SQL forte por documento
- ❌ Duplica draft→issued, print, snapshots e UI
- ❌ Viola mudança mínima

### Rename para `clinical_documents`

- ✅ Nome alinhado ao domínio
- ❌ Migration/churn amplo (rotas, actions, seeds) sem ganho funcional no 1º ship
- ❌ Adiado conscientemente (Later)

### `kind` + `metadata` em `prescriptions` ✅ Chosen

- ✅ Reusa ADR-005/008
- ✅ Backfill simples
- ❌ Naming legado até rename

### Embutir na nota clínica

- ❌ Mistura evolução com documento emitível
- ❌ Cardinalidade 1 nota vs 0..N documentos
- ❌ Sem freeze de timbrado

## Links

- [ADR-005 — Receitas](./005-prescriptions.md)
- [ADR-008 — Designer de templates](./008-prescription-template-designer.md)
- [Roadmap H1 · E13](../wiki/Roadmap.md)
- `src/db/schema/prescriptions.ts`
- `src/modules/medical-records/`
