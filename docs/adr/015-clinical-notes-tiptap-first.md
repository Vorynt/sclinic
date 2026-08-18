# ADR-015: Anotações clínicas TipTap-first

- **Date**: 2026-08-17
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, medical-records, clinical-notes, tiptap, ux
- **Supersedes (partial)**: fluxo form-based de templates de nota (MVP E5)

## Context and Problem Statement

O MVP de anotações clínicas (E5) entregou **5 templates estruturados** como formulários RHF+Zod. O `formValues` era a fonte da verdade; o TipTap (`content`) era compilado no save. Isso gerou fricção:

- Picker obrigatório na primeira nota
- Template "Em branco" usava textarea, não o editor rich text
- Dois caminhos de persistência (form vs TipTap legado)
- Médicos preferem escrita livre com estrutura opcional, não formulários longos

## Decision Drivers

- Alinhar UX com o comportamento real do consultório (evolução livre)
- Simplificar arquitetura (uma fonte da verdade: `content` + `plainText`)
- Reutilizar `ClinicalNoteEditor` já existente
- Manter compatibilidade com notas antigas (`templateId`/`formValues` no banco)
- Sem migration de banco — schema já suporta ambos os modos
- Templates futuros por especialidade (E19) como **snippets TipTap**, não form builder

## Considered Options

- Manter form-based como padrão e só melhorar template "Em branco"
- TipTap livre como padrão + templates como snippets opcionais inseríveis
- Remover templates completamente
- Form builder customizável por clínica (escopo E19/H3)

## Decision Outcome

Chosen option: **TipTap livre como padrão + snippets opcionais**, because entrega UX natural, reduz dual-path e preserva modelos clínicos (SOAP, retorno, etc.) sem bloquear a escrita.

### Regras

| Tema | Decisão |
|------|--------|
| Fonte da verdade | `content` (TipTap JSON) + `plainText` |
| UI no attendance | Editor aberto por padrão; sem picker obrigatório |
| Modelos clínicos | Snippets inseríveis via toolbar ("Inserir modelo") |
| Upsert | `upsertClinicalNoteContentSchema` (content + plainText) |
| Legado form | `upsertClinicalNoteFormSchema` mantido na API; UI não envia mais |
| Notas antigas com `templateId` | Leitura via `content` compilado; re-save limpa `templateId`/`formValues` |
| E19 (especialidades) | Packs = biblioteca de snippets TipTap, não form builder |

### Consequências

**Positivas**

- UX mais rápida e familiar para clínicos
- Menos código dual-path na UI
- Editor enriquecido (formatação, headings, listas, citações)
- Base para IA clínica sobre `plainText`/`content`

**Negativas**

- Perda de dados estruturados por campo (`formValues`)
- Sem validação automática de seções obrigatórias (ex.: SOAP completo)
- `ClinicalNoteFormRenderer` e `compile-clinical-note-form.ts` ficam legado (remover em ciclo futuro)

## Arquivos-chave

- `src/modules/medical-records/components/ClinicalNotesPanel.tsx`
- `src/modules/medical-records/components/ClinicalNoteEditor.tsx`
- `src/modules/medical-records/utils/clinical-note-snippets.ts`
- `src/modules/medical-records/schemas/clinical-note.schema.ts`
- `src/db/schema/clinical-notes.ts`
