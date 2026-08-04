# ADR-005: Receitas médicas (prescrição simples)

- **Date**: 2026-07-28
- **Status**: Accepted (layout source/cardinality partially superseded by [ADR-008](008-prescription-template-designer.md); typed documents / atestado opening partially superseded by [ADR-010](010-clinical-document-kinds.md))
- **Deciders**: Time sclinic
- **Tags**: architecture, medical-records, prescriptions, print

## Context and Problem Statement

No atendimento, o profissional precisa emitir receitas imprimíveis com o timbrado da clínica. Cada clínica pode ter formato próprio. Não queremos depender de storage externo (S3/Blob) nem de PDF persistido: o documento deve viver no banco e ser reaberto/impresso depois. Hoje só existe texto livre de “prescrição” dentro dos templates de nota clínica — insuficiente como documento emitível.

## Decision Drivers

- Fluxo Action → Service → Repository; domínio em `medical-records`
- MVP rápido: corpo em texto livre; só receita simples
- Layout padrão sclinic + override 100% custom (HTML) por clínica
- Documento emitido imutável: congela layout + dados demográficos
- 0..N receitas por atendimento
- Sem storage externo; print via HTML + `@media print`
- RLS por `clinicId`; auditável

## Considered Options

- Extender `clinical_notes` / campo `plan_rx` como “receita”
- Nova entidade `prescriptions` + layouts versionados em `medical-records`, conteúdo no banco, render na hora
- Gerar e guardar PDF em storage na emissão

## Decision Outcome

Chosen option: **"Entidade `prescriptions` + `prescription_layouts` em `medical-records`"**, because isola o documento clínico imprimível da evolução da nota, permite customização de timbrado sem storage, e congela o que foi emitido.

### Regras do MVP

| Tema | Decisão |
|------|---------|
| Conteúdo | Texto livre (`body` HTML + `plainText`) |
| Layout | Default no código; clínica pode gravar HTML custom versionado |
| Emissão | `draft` → `issued`; na emissão congela `layoutHtml` + snapshots |
| Cardinalidade | 0..N por `appointmentId` (sem unique) |
| Tipo | Só receita simples (sem coluna `kind` no MVP) |
| Print | Rota/view HTML; sem PDF server-side |
| Storage | Nenhum |

### Modelo (resumo)

- **`prescription_layouts`**: timbrado por clínica (ver ADR-008: DocumentModel + até 3 templates). Sem linha ativa = default do sistema.
- **`prescriptions`**: FKs clinic/patient/appointment/professional; `status` `draft` \| `issued`; corpo editável só em draft; campos de snapshot preenchidos só em `issued`.
- Placeholders do layout: `{{clinic.*}}`, `{{patient.*}}`, `{{professional.*}}`, `{{body}}`, `{{issuedAt}}` (contrato detalhado na implementação).
- HTML custom sanitizado no save (allowlist).
- Permissões iniciais: `RECORDS_READ` / `RECORDS_WRITE`.
- UI: painel no atendimento, histórico no paciente, settings para modelo de receita.

### Fora do MVP

Itens estruturados de medicamento, controle especial, PDF/storage, assinatura digital, catálogo ANVISA, envio por WhatsApp/e-mail.

> **Atualização:** atestado e demais documentos tipados passam a ser cobertos por [ADR-010](010-clinical-document-kinds.md) (`kind` em `prescriptions`). Receita simples deste ADR permanece.

### Positive Consequences

- Reabrir/imprimir sem storage; custo e complexidade menores
- Timbrado custom sem acoplar à nota clínica
- Histórico fiel ao que foi impresso na data (snapshot)
- Extensível depois a tipos/itens sem reescrever o ciclo draft → issued

### Negative Consequences

- HTML custom malformado pode quebrar print (mitigado por sanitização + preview)
- Texto livre não habilita renovação inteligente / posologia tipada (aceito no MVP)
- Congelar HTML duplica bytes no banco por receita emitida (aceitável no volume clínico típico)
- Default do sistema versionado só no código: mudar o default **não** altera receitas já emitidas (correto), mas drafts passam a previewar o default novo

## Pros and Cons of the Options

### Extender clinical notes

- ✅ Menos tabelas
- ❌ Mistura evolução clínica com documento emitível
- ❌ 1 nota por appointment vs 0..N receitas
- ❌ Sem freeze de timbrado

### Entidade prescriptions + layouts ✅ Chosen

- ✅ Documento próprio, auditável, imprimível
- ✅ Custom por clínica sem storage
- ✅ Snapshot na emissão
- ❌ Mais schema/serviço no módulo

### PDF em storage

- ✅ Fidelidade visual forte
- ❌ Storage, custos, lifecycle de arquivo
- ❌ Overkill para MVP de receita simples

## Links

- `architecture/001-feature-based.md`
- `architecture/004-server-actions.md` … `006-repositories.md`
- `src/db/schema/prescriptions.ts` (proposed)
- `src/db/schema/clinical-notes.ts` (padrão de documento clínico)
- `src/modules/medical-records/` (módulo alvo)
