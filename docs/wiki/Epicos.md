# Épicos

Épicos de produto inferidos das capacidades entregues e das decisões (ADRs). IDs internos da wiki (`E1`…).

| ID | Épico | Status | ADRs | Módulos |
|----|-------|--------|------|---------|
| **E1** | Plataforma, identidade e multi-clínica | Done | 007 | authentication, clinics, users |
| **E2** | Monetização SaaS (Stripe) | Done | 003, 004 | billing |
| **E3** | Cadastro clínico (pacientes & profissionais) | Done | 007 | patients, professionals |
| **E4** | Agenda e atendimento | Done | 006 | appointments, dashboard |
| **E5** | Prontuário e documentos clínicos | Done | 005 | medical-records |
| **E6** | Contas a receber da clínica | Done | 002, 006, 009 | billing (charges) |
| **E7** | Operação da recepção em tempo real | Done | 006 | dashboard, core/realtime |
| **E8** | Governança, auditoria, settings e ajuda | Done | 001 | audit, settings, clinics, help |
| **E9** | Aquisição (marketing site) | Done | — | marketing |
| **E10** | Pagamentos clínicos automatizados | Next | 002 | billing |
| **E11** | Inventário / estoque | Deferred | — | inventory (vazio) |
| **E12** | Escala realtime & multi-owner | Later | 003, 006 | core, billing |

## Detalhamento

### E1 — Plataforma
Auth (login, signup, verify, reset, change-password), convites equipe/profissional, select-clinic, membership suspended, onboarding plan→clinic→hours. Owner pode optar por perfil clínico no create da clínica (ADR-007).

### E2 — SaaS
Planos, Checkout, Customer Portal, webhook, entitlement gate, over_limit, regularização Portal-first, delete com cancel Stripe.

### E3 — Cadastros
CRUD pacientes (CPF único/clínica), convite e perfil de profissionais com quota. Owner pode criar o próprio perfil clínico sem invite (ADR-007).

### E4 — Agenda
Calendário, status machine, attendance workspace, self-schedule, disponibilidade por horário da clínica.

### E5 — Prontuário
Notas (templates), vitais, alertas do paciente, receitas draft→issued + print + designer de templates (blocos, até 3).

### E6 — Recebíveis
Charge 1:1, markPaid/cancel, listagem `/billing`, collect vs view. Catálogo de serviços, desconto %, cortesia/retorno (ADR-009).

### E7 — Recepção
Board derivado de status+charge, SSE `clinic.ops`, desacoplar pagamento do “concluir” médico.

### E8 — Governança
Audit logs, settings (geral, hours, prescriptions, usage, danger), RBAC seed, central de ajuda `/help`.

### E9 — Marketing
Landing pública.

### E10–E12
Ver [Roadmap](Roadmap).
