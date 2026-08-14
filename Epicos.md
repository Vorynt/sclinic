# Épicos

Épicos de produto inferidos das capacidades entregues, ADRs e [Roadmap](Roadmap) priorizado. IDs internos da wiki (`E1`…).

| ID | Épico | Status | ADRs | Módulos |
|----|-------|--------|------|---------|
| **E1** | Plataforma, identidade e multi-clínica | Done | 007 | authentication, clinics, users |
| **E2** | Monetização SaaS (Stripe) | Done | 003, 004 | billing |
| **E3** | Cadastro clínico (pacientes & profissionais) | Done | 007 | patients, professionals |
| **E4** | Agenda e atendimento | Done | 006 | appointments, dashboard |
| **E5** | Prontuário e documentos clínicos (MVP) | Done | 005, 008 | medical-records |
| **E6** | Contas a receber da clínica | Done | 002, 006, 009 | billing (charges) |
| **E7** | Operação da recepção em tempo real | Done | 006 | dashboard, core/realtime |
| **E8** | Governança, auditoria, settings e ajuda | Done | 001 | audit, settings, clinics, help |
| **E9** | Aquisição (marketing site) | Done | — | marketing |
| **E10** | Pagamentos clínicos automatizados | Next | 002 | billing |
| **E11** | Inventário / estoque | Deferred | — | inventory (vazio) |
| **E12** | Escala realtime & multi-owner | Later | 003, 006 | core, billing |
| **E13** | Documentos clínicos além da receita | Partial (kind + declaração Done) | 005, 010 | medical-records |
| **E14** | CRM do paciente e retenção | Backlog H1→H3 | — | patients, dashboard |
| **E15** | Agenda avançada | Partial (H2 Done; recorrência/sala H3) | 011 | appointments, professionals |
| **E16** | Recepção operacional (lote / balcão) | Partial (H2 Done; extensões H3) | 006, 011 | appointments, dashboard |
| **E17** | Pré-consulta e portal do paciente | Backlog H3 | — | medical-records, auth, portal |
| **E18** | Indicadores, automações e IA clínica | Later / H3+ | — | dashboard, medical-records |
| **E19** | Módulos / templates por especialidade | Later / H3+ | — | medical-records |

## Detalhamento

### E1 — Plataforma
Auth (login, signup, verify, reset, change-password), convites equipe/profissional, select-clinic, membership suspended, onboarding plan→clinic→hours. Owner pode optar por perfil clínico no create da clínica (ADR-007).

### E2 — SaaS
Planos, Checkout, Customer Portal, webhook, entitlement gate, over_limit, regularização Portal-first, delete com cancel Stripe.

### E3 — Cadastros
CRUD pacientes (CPF único/clínica), convite e perfil de profissionais com quota. Owner pode criar o próprio perfil clínico sem invite (ADR-007).

### E4 — Agenda
Calendário, status machine, attendance workspace, self-schedule, disponibilidade por horário da clínica.

### E5 — Prontuário (MVP entregue)
Notas (templates genéricos), vitais, alertas do paciente, receitas draft→issued + print + designer de templates (blocos, até 3). Especialidades e mais tipos de documento → E13 / E19.

### E6 — Recebíveis
Charge 1:1, markPaid/cancel, listagem `/billing`, collect vs view. Catálogo de serviços, desconto %, cortesia/retorno (ADR-009). **Done (ADR-011):** `dueAt` por cobrança + aba Inadimplentes agrupada por paciente. Gateway → E10. Comissão → extensão no [Roadmap](Roadmap).

### E7 — Recepção
Board derivado de status+charge, SSE `clinic.ops`, desacoplar pagamento do “concluir” médico.

### E8 — Governança
Audit logs, settings (geral, hours, prescriptions, usage, danger), RBAC seed, central de ajuda `/help`, roadmap de setup na home do owner (`OwnerSetupRoadmap`).

### E9 — Marketing
Landing pública.

### E10 — Pagamentos clínicos automatizados
Trilha Next (ADR-002). Fora do backlog de produto H1–H3 (escopo explícito); permanece no roadmap técnico.

### E11 — Inventário
Deferred.

### E12 — Escala
Broker realtime multi-instância; N clínicas owned por assinatura.

### E13 — Documentos clínicos (H1)
`kind` + `metadata` em `prescriptions` (ADR-010). **Done:** declaração de comparecimento. **Next:** atestado, solicitação de exames. Assinatura eletrônica (consentimento/LGPD) no H3.

### E14 — CRM e retenção (H1→H3)
Overview consolidado do paciente (H1); pacientes inativos + campanhas leves (H3). Sem WhatsApp no primeiro corte.

### E15 — Agenda avançada (H2 Done; H3 pendente)
**Done (ADR-011):** bloqueios (`schedule_blocks`), horário do profissional (`professional_business_hours`, interseção com a clínica), lista de espera com promoção sem hold, modalidade presencial/online. **H3:** recorrência, sala/equipamento (só se ICP exigir).

### E16 — Recepção operacional (H2 Done; H3 pendente)
**Done (ADR-011):** confirmação em lote no board do dia (`confirmAppointmentsBatchSchema`), cadastro rápido de paciente (`PatientFormDialog` variant `quick`). **H3:** tarefas internas, histórico de contatos, reagendamento em massa.

### E17 — Pré-consulta e portal (H3)
Formulários antes da consulta; portal do paciente (agendar, documentos, cadastro).

### E18 — Indicadores, automações e IA (H3+)
KPIs gerenciais; automações de retorno/falta; IA com supervisão do profissional.

### E19 — Especialidades (H3+)
Núcleo comum + packs de templates/formulários/documentos por especialidade.

## Como evoluir

Ao shipar: atualizar status na tabela e o [Roadmap](Roadmap). Novos épicos só quando o boundary de produto for claro (não inventar módulo sem alinhar `architecture/` + lista de domínios).
