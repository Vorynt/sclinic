# Catálogo de features

Inventário do que o sistema faz hoje. Status: **Done** | **Partial** | **Planned** | **Deferred**.

## E1 — Plataforma

| Feature | Status | Onde |
|---------|--------|------|
| Login / sign-up / forgot-reset | Done | `(auth)` |
| Verificação de e-mail | Done | `/verify-email` |
| Troca forçada de senha provisória | Done | `/change-password` |
| Convite de equipe | Done | `/invite`, users |
| Convite de profissional | Done | `/invite/professional` |
| Aceite de invite marca e-mail verificado | Done | notebook auth-invite |
| Criar clínica + membership owner | Done | onboarding |
| Horários da clínica | Done | onboarding/hours, settings |
| Switcher multi-clínica | Done | membership active/suspended |
| Tela membership inactive | Done | `/membership-inactive` |
| Select-clinic / subscription blocked | Done | ADR-003 guard |

## E2 — SaaS

| Feature | Status | Onde |
|---------|--------|------|
| Catálogo de planos + cotas | Done | seed plans |
| Checkout Stripe | Done | PlanPicker |
| Customer Portal | Done | `/account/subscription` |
| Webhook sync | Done | `/api/stripe/webhook` |
| Entitlement `trialing\|active\|past_due` | Done | requireClinic |
| Modo over_limit + banner | Done | ADR-004 |
| Bloqueio invite/profissional no limite | Done | assertPlanCapacity |
| Cota storage | Planned | ADR-004 |
| N clínicas owned por assinatura | Later | ADR-003 MVP 1:1 |

## E3 — Cadastros

| Feature | Status | Onde |
|---------|--------|------|
| Lista/busca/CRUD pacientes | Done | `/patients` |
| Soft delete paciente (archived) | Done | patients |
| Detalhe paciente + abas | Done | patient detail nav |
| Convite/gestão profissionais | Done | `/professionals` |
| Perfil profissional (conselho, etc.) | Done | invite onboarding |
| Active/inactive profissional | Done | professionals |

## E4 — Agenda

| Feature | Status | Onde |
|---------|--------|------|
| Calendário dia/semana/mês | Done | `/appointments` |
| Criar/remarcar/cancelar | Done | appointments |
| Status: scheduled→…→completed | Done | appointment.service |
| Iniciar atendimento (role gate) | Done | checked_in |
| Workspace attendance | Done | `(attendance)` |
| Self-schedule doctor/nurse | Done | constants |
| Disponibilidade vs clinic hours | Done | availability service |
| Valor no agendamento → charge | Done | amountCents + collect |

## E5 — Prontuário

| Feature | Status | Onde |
|---------|--------|------|
| Nota clínica 1:1 appointment | Done | medical-records |
| Templates de nota | Done | clinical-note-templates |
| Sinais vitais + IMC derivado | Done | vital signs |
| Alertas clínicos do paciente | Done | clinical alerts |
| Receitas draft/issued | Done | ADR-005 |
| Print HTML | Done | `(print)` |
| Layout custom por clínica | Done | `/settings/prescriptions` |
| Tipos avançados de receita / PDF | Planned/Later | ADR-005 |

## E6 — Recebíveis

| Feature | Status | Onde |
|---------|--------|------|
| Charge 1:1 appointment | Done | ADR-002 |
| markPaid / cancel | Done | charge.service |
| Listagem `/billing` | Done | financial.view |
| Métodos manuais | Done | cash, pix_manual, … |
| Gateway clínico | Planned | provider fields |

## E7 — Recepção

| Feature | Status | Onde |
|---------|--------|------|
| Board 3 colunas | Done | ReceptionOpsBoard |
| SSE clinic.ops | Done | `/api/realtime/clinic` |
| Médico conclui sem cobrar | Done | ADR-006 |
| Broker multi-instância | Next | ADR-006 |

## E8 — Governança

| Feature | Status | Onde |
|---------|--------|------|
| Audit log append-only | Done | ADR-001 |
| UI `/settings/audit` | Done | audit.read |
| Settings geral/hours/danger | Done | settings + clinics |
| Uso do plano (owner) | Done | `/settings/usage` |
| Help `/help` | Planned | nav disabled |

## E9 — Marketing

| Feature | Status | Onde |
|---------|--------|------|
| Landing pública | Done | `/` |

## E11 — Inventário

| Feature | Status | Onde |
|---------|--------|------|
| Estoque | Deferred | módulo/schema vazios |

Para regras detalhadas, abra a página **Domínio-*** correspondente.
