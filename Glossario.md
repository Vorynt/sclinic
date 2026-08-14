# Glossário

## Tenant e papéis

| Termo | Definição |
|-------|-----------|
| **Clinic / clínica** | Tenant operacional; dados escopados por `clinicId` |
| **Membership** | Vínculo user ↔ clínica com role (`active` / `suspended` / `removed`) |
| **Owner** | Papel que cria a clínica e paga a assinatura SaaS |
| **Perfil clínico** | Registro em `professionals` agendável; pode coexistir com membership `owner` (ADR-007) — não é dual-role RBAC |
| **Profissional de saúde** | Papel RBAC `clinician` (capabilities clínicas) **ou** o profissional na agenda; na UI o termo genérico cobre médico, dentista, fisio, etc. |
| **Tipo de profissão** | `profession_type` no perfil: physician, dentist, physiotherapist, nurse, pharmacist, psychologist, other (ADR-012) |

## Agenda e clínico

| Termo | Definição |
|-------|-----------|
| **Attendance** | Workspace de atendimento `/appointments/[id]/attendance` |
| **Prescription** | Receita médica (`draft` → `issued`) |
| **Prescription template** | Modelo de timbrado da clínica (até 3); DocumentModel de blocos → HTML |
| **Board** | Painel operacional da recepção (ADR-006) |
| **Self-schedule** | Clinician/nurse só veem/agendam a si |

## Billing

| Termo | Definição |
|-------|-----------|
| **Entitled** | Assinatura viva: `trialing` \| `active` \| `past_due` |
| **Over limit** | Uso > cotas do plano após downgrade; não derruba sessão |
| **Living subscription** | Assinatura SaaS não terminal do user |
| **Charge** | Cobrança clínica 1:1 com appointment (ADR-002) |
| **Serviço (clínica)** | Item do catálogo da clínica com preço fixo; precifica a consulta (ADR-009) |
| **Billing kind** | Motivo da cobrança: `standard` \| `courtesy` \| `return` (ADR-009) |
| **Collect** | Permissão `financial.collect` — cobrar sem ver lista `/billing` |

## Engenharia

| Termo | Definição |
|-------|-----------|
| **ADR** | Architecture Decision Record em `docs/adr/` |
| **Module** | Pasta `src/modules/<feature>/` com boundaries |
| **Server Action** | Entrypoint `"use server"` que valida e delega ao service |
| **SSE** | Server-Sent Events em `/api/realtime/clinic` |
| **Soft delete** | Arquivamento / suspended / canceled sem hard delete |

## Ver também

- [RBAC e permissões](RBAC-e-Permissoes)
- [Índice de decisões](Indice-de-Decisoes)
- [Visão do produto](Visao-do-Produto)
