# ADR-008: Designer de templates de receita (blocos + multi-template)

- **Date**: 2026-07-28
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, medical-records, prescriptions, templates
- **Supersedes (partial)**: ADR-005 — cardinalidade e fonte do layout

## Context and Problem Statement

O ADR-005 entregou receitas com um único timbrado HTML por clínica, editado em textarea. Clínicas precisam personalizar o layout com elementos visuais (não HTML puro) e manter até 3 modelos nomeados (ex.: padrão vs controlados), escolhidos na criação da receita.

## Decision Drivers

- Manter print HTML + freeze na emissão (sem PDF/storage)
- Isolar o designer do ciclo clínico draft→issued
- Hierarquia previsível (não canvas de posição livre)
- Continuar em `medical-records` (lista fechada de módulos)
- Compatível com placeholders e sanitização existentes

## Considered Options

- Continuar HTML como fonte da verdade + editor visual que mascara HTML
- DocumentModel JSON (blocos empilhados) → compila HTML; até 3 templates nomeados
- Módulo top-level `documents` / designer genérico no design system

## Decision Outcome

Chosen option: **DocumentModel JSON de blocos empilhados + até 3 templates em `prescription_layouts`, pacote interno `prescription-template-designer/`**.

| Tema | Decisão |
|------|---------|
| Fonte da verdade | `documentModel` (jsonb); `html` é cache compilado |
| Editor | Blocos empilhados (letterhead, title, patient, body, professional, text, divider, spacer) |
| Posição livre | Fora de escopo |
| Cardinalidade | ≤ 3 layouts ativos por clínica; um `isDefault` |
| Uso | Profissional escolhe `layoutId` ao criar; null → default/system |
| Isolamento | Pasta em `medical-records`; domínio clínico consome só HTML/`layoutId` |
| Emissão | Continua congelando `layoutHtml` (+ `layoutId`/`layoutVersion`) |
| Sem custom | System default = `DEFAULT_PRESCRIPTION_DOCUMENT_MODEL` compilado |

### Revisões ao ADR-005

- Deixa de valer: “no máximo um ativo” e “override 100% HTML como fonte”
- Mantém: entidade própria, draft→issued, print HTML, sem PDF/storage, placeholders

## Consequences

### Positive

- UX de personalização sem exigir HTML
- Vários modelos sem acoplar a `kind` de receita
- Designer testável/isolado; compile unitário

### Negative

- Layouts HTML legados precisam de migração para model (default estruturado + html preservado no cache)
- Mais schema/UI em settings

## Links

- `docs/adr/005-prescriptions.md`
- `src/modules/medical-records/prescription-template-designer/`
- `src/db/schema/prescriptions.ts`
