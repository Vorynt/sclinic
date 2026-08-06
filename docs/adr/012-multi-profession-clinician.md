# ADR-012: Multi-profissão — `clinician` × `profession_type`

- **Date**: 2026-08-06
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, professionals, rbac, multi-profession
- **Extends**: ADR-007 (owner clinical profile), ADR-011 (self-schedule)
- **Roadmap**: multi-profissão (produto)

## Context and Problem Statement

O domínio já usa `professionals` (perfil clínico agendável), mas o produto fala “Médico(a)” via role RBAC `doctor` e só convida `doctor|nurse`. Queremos clínicas multi-profissão (médicos, dentistas, fisios, etc.) sem explodir a matriz RBAC nem reabrir dual membership (ADR-007).

## Decision Drivers

- Nomenclatura de produto: **Profissional de saúde**
- Fluxo Action → Service → Repository; módulo `professionals` canônico
- Self-schedule e iniciar atendimento continuam por role clínico (ADR-011)
- Conselho já é parcialmente genérico (`CRM|CRO|COREN|CRF|OTHER`)
- Evitar um `roleKey` por profissão (dentist, physio, …) sem ganho de permission

## Considered Options

- Role por profissão (`dentist`, `physiotherapist`, …) + homes/FAQ por role
- Manter key `doctor` só mudando label na UI
- **Papel RBAC genérico `clinician` + `profession_type` no perfil** (escolhida)

## Decision Outcome

Chosen option: **migrar `doctor` → `clinician` (label “Profissional de saúde”) e gravar `profession_type` em `professionals`**.

| Tema | Decisão |
|------|---------|
| RBAC | `clinician` herda permissões de `doctor`; **manter `nurse`** pelo gap (`patients.write`, `financial.collect`) |
| Profissão | Enum/coluna `profession_type` no perfil: `physician`, `dentist`, `physiotherapist`, `nurse`, `pharmacist`, `psychologist`, `other` |
| Convite | UI escolhe **tipo de profissão**; service deriva `roleKey`: `nurse` → `nurse`, demais → `clinician` |
| Conselho | Estender enum com `CREFITO`, `CRP`; defaults por `profession_type` |
| Pronomes | Incluir `ft` / `fta` (fisio); demais via mapa de defaults |
| Owner (ADR-007) | Membership continua `owner`; form usa `professionType` só para defaults de UI + gravação do perfil |
| Self-schedule | Sets usam `clinician` + `nurse` (no lugar de `doctor` + `nurse`) |
| Sem role por dentista/fisio | Identidade de profissão vive no perfil, não no RBAC |

### Positive Consequences

- Dentista/fisio/etc. usam o mesmo capability set sem novas roles
- Copy e glossário alinhados a “Profissional de saúde”
- ADR-007 intacto (owner ≠ dual-role)

### Negative Consequences

- Migration de `roles.key` `doctor` → `clinician` + atualização de constants/tests/FAQ
- Nurse continua papel RBAC separado (não só `profession_type`) enquanto o gap de permissões for produto

### Fora deste ADR

Catálogo de especialidades, templates por especialidade (E19), agenda por sala/equipamento (E15), regras de documento por conselho (receita controlada, etc.).
