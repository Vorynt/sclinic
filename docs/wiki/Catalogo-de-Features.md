# Catálogo de features

Inventário do que o sistema faz hoje. Status: **Done** | **Partial** | **Planned** | **Deferred**.

## Sumário

- [Entregue (E1–E9)](#entregue-e1e9)
- [Em evolução (E13–E18)](#em-evolução-e13e18)
- [Reservado (E11)](#reservado-e11)

Para regras detalhadas, abra a página **Domínio-*** correspondente. Prioridade e critérios: [Roadmap](Roadmap).

## Entregue (E1–E9)

### E1 — Plataforma

| Feature | Status | Onde |
|---------|--------|------|
| Login / sign-up / forgot-reset | Done | `(auth)` |
| Remember-me no login | Done | `SignInForm` |
| 2FA (TOTP + backup) | Done | `/two-factor`, `/account/security` |
| Modal pós-login incentiva 2FA | Done | `TwoFactorNudgeDialog` |
| Revogar sessões (exceto a atual) | Done | `/account/security` |
| Verificação de e-mail | Done | `/verify-email` |
| Troca forçada de senha provisória | Done | `/change-password` |
| Convite de equipe | Done | `/invite`, users |
| Convite de profissional | Done | `/invite/professional` |
| Aceite de invite marca e-mail verificado | Done | notebook auth-invite |
| Criar clínica + membership owner | Done | onboarding |
| Owner com perfil clínico (alsoPractices + CTA) | Done | ADR-007; onboarding + `/professionals` |
| Horários da clínica | Done | onboarding/hours, settings |
| Switcher multi-clínica | Done | membership active/suspended |
| Tela membership inactive | Done | `/membership-inactive` |
| Select-clinic / subscription blocked | Done | ADR-003; regularizar (`unpaid`) ou assinar novamente (`canceled`) + excluir |
| Conta: clínicas vinculadas | Done | `/account/clinics`; acessar / sair / excluir |

### E2 — SaaS

| Feature | Status | Onde |
|---------|--------|------|
| Catálogo de planos + cotas | Done | seed plans |
| Checkout Stripe | Done | PlanPicker; trial 7d na 1ª assinatura |
| Customer Portal | Done | `/account/subscription` (também sem entitlement) |
| Sync de troca de plano (Portal) | Done | webhook prioriza `price.id`; alert em `/account/subscription` |
| Regularização vs nova assinatura | Done | unpaid/incomplete → Portal; canceled → Checkout |
| Delete clinic cancela Stripe | Done | MVP 1:1; teardown sem entitlement |
| Webhook sync | Done | `/api/stripe/webhook` |
| Entitlement `trialing\|active\|past_due` | Done | requireClinic |
| Modo over_limit + banner | Done | ADR-004 |
| Bloqueio invite/profissional no limite | Done | assertPlanCapacity |
| Cota storage | Planned | ADR-004 |
| N clínicas owned por assinatura | Later | ADR-003 MVP 1:1 |

### E3 — Cadastros

| Feature | Status | Onde |
|---------|--------|------|
| Lista/busca/CRUD pacientes | Done | `/patients` |
| Observações administrativas (cadastro) | Done | `patients.notes`; `PatientForm` (variante full) |
| Soft delete paciente (archived) | Done | patients |
| Detalhe paciente + abas | Done | patient detail nav |
| Overview consolidado (CRM mínimo) | Planned | Roadmap H1 · E14 |
| Pacientes inativos (última consulta + CTA) | Planned | Roadmap H3 · E14 |
| Convite/gestão profissionais | Done | `/professionals` |
| Multi-profissão (`profession_type` + `clinician`) | Done | ADR-012 |
| Owner cria próprio perfil clínico (sem invite) | Done | ADR-007 |
| Active/inactive profissional | Done | professionals |
| Cadastro rápido de paciente (nome/CPF/telefone) | Done | ADR-011; `PatientFormDialog` variant `quick` |

### E4 — Agenda

| Feature | Status | Onde |
|---------|--------|------|
| Calendário dia/semana/mês | Done | `/appointments`; filtros em drawer (profissional, modalidade, paciente) |
| Criar/remarcar/cancelar | Done | appointments |
| Agendamento rápido (modal) + completo (`/appointments/new`) | Done | `AppointmentForm` `quick`/`full`; `buildAppointmentNewHref` |
| Status: scheduled→…→completed | Done | appointment.service |
| Iniciar / concluir atendimento (assignee + role gate) | Done | checked_in / completed |
| Workspace attendance | Done | cockpit notas-no-centro; `?panel=` |
| Self-schedule clinician/nurse | Done | constants |
| Disponibilidade vs clinic hours | Done | availability service |
| Valor no agendamento → charge | Done | amountCents + collect |
| Bloqueio de horários | Done | ADR-011; profissional ou clinic-wide; self-schedule; remoção na agenda |
| Horário do profissional | Done | ADR-011; self-edit + override `professionals.manage` |
| Lista de espera + encaixe | Done | ADR-011; `WaitlistPanel`, promote → appointment |
| Modalidade presencial / online | Done | ADR-011; campo `modality` + filtro no drawer da agenda / badge |
| Horários recorrentes | Planned | Roadmap H3 · E15 |
| Agenda por sala / equipamento | Later | Roadmap H3 · E15 (se ICP) |

### E5 — Prontuário

| Feature | Status | Onde |
|---------|--------|------|
| Nota clínica 1:1 appointment | Done | medical-records |
| Editor TipTap livre (anotações) | Done | ADR-015; ClinicalNoteEditor |
| Autosave com debounce (anotações) | Done | ClinicalNotesPanel; indicador “Salvo às HH:mm” |
| Snippets de modelo clínico | Done | ADR-015; clinical-note-snippets |
| Sinais vitais + IMC derivado | Done | vital signs |
| Alertas clínicos do paciente | Done | clinical alerts |
| Receitas draft/issued | Done | ADR-005 |
| Print HTML | Done | `(print)` |
| Layout custom por clínica | Done | `/settings/prescriptions` |
| Designer de templates (blocos) | Done | ADR-008 |
| Cor de destaque no modelo de receita | Done | ADR-008; `accentColor` no DocumentModel |
| Até 3 templates nomeados | Done | ADR-008 |
| Tipos avançados de receita / PDF | Planned/Later | ADR-005 |
| `kind` unificado de documentos clínicos | Done | ADR-010 |
| Declaração de comparecimento | Done | ADR-010; sheet Documentos no attendance |
| Atestado médico | Done | ADR-010; `daysOff`, CID/obs. opcionais; system layout |
| Solicitação de exames (documento) | Done | ADR-010; lista de exames + indicação clínica |
| Templates / packs por especialidade | Later | Roadmap H3 · E19 |

### E6 — Recebíveis

| Feature | Status | Onde |
|---------|--------|------|
| Charge 1:1 appointment | Done | ADR-002 |
| markPaid / cancel | Done | charge.service |
| Listagem `/billing` | Done | financial.view |
| Métodos manuais | Done | cash, pix_manual, … |
| Catálogo de serviços (preço fixo) | Done | ADR-009; `/services` |
| Desconto % na agenda / pagamento | Done | ADR-009 |
| Cortesia / retorno (charge R$ 0 paid) | Done | ADR-009 |
| Visão / filtro inadimplentes | Done | ADR-011; `dueAt` + aba Inadimplentes agrupada por paciente |
| Gateway clínico | Planned | provider fields · E10 |
| Comissão / caixa diário | Later | Roadmap Later |

### E7 — Recepção

| Feature | Status | Onde |
|---------|--------|------|
| Board 3 colunas | Done | ReceptionOpsBoard |
| SSE clinic.ops | Done | `/api/realtime/clinic` |
| Médico conclui sem cobrar | Done | ADR-006; profissional de saúde / clinician |
| Broker multi-instância | Next | ADR-006 |
| Confirmação em lote | Done | ADR-011; `ReceptionOpsBoard` seleção + confirmar dia |

### E8 — Governança

| Feature | Status | Onde |
|---------|--------|------|
| Audit log append-only | Done | ADR-001 |
| UI `/settings/audit` | Done | audit.read |
| Settings geral/hours/danger | Done | settings + clinics |
| Uso do plano (owner) | Done | `/settings/usage` |
| Help `/help` | Done | módulo `help`; FAQ por papel; nav + atalho nas homes |
| Tour guiado de novo usuário | Done | modal opt-in no 1º acesso ao dashboard; spotlight na nav; replay em `/help` |
| Roadmap primeiros passos (owner home) | Done | `OwnerSetupRoadmap`; profissional → serviço → paciente → 1º agendamento |

### E9 — Marketing

| Feature | Status | Onde |
|---------|--------|------|
| Landing pública (captação) | Done | `/` — hero teste grátis, benefícios, features, showcase (agenda/pacientes/atendimento/faturamento) |
| Termos, políticas e documentos legais | Done | Hub `/legal` · 9 docs públicos · footer · aceite Termos/Privacidade no sign-up (placeholders; revisão jurídica) |
| Campanhas (aniversário / retorno) | Planned | Roadmap H3 · E14 (sem WhatsApp no 1º corte) |

## Em evolução (E13–E18)

### E13 — Documentos clínicos (além da receita)

| Feature | Status | Onde |
|---------|--------|------|
| `kind` + `metadata` em prescriptions | Done | ADR-010 |
| Declaração de comparecimento | Done | attendance Documentos |
| Atestado médico | Done | `MedicalCertificateFormDialog`; metadata `daysOff`/`cid`/`notes` |
| Solicitação de exames | Done | `ExamRequestFormDialog`; metadata `exams[]`/`notes` |
| Anexos clínicos (upload/GED) | Later | ADR-014; trilha storage separada de documentos emitidos |
| Assinatura eletrônica (consentimento/LGPD) | Planned | Roadmap H3 |

### E14 — CRM e retenção

| Feature | Status | Onde |
|---------|--------|------|
| Detalhe paciente + abas | Done | patient detail nav |
| Overview consolidado (última/próxima + financeiro) | Planned | Roadmap H1 · E14 |
| Pacientes inativos (última consulta + CTA) | Planned | Roadmap H3 · E14 |

### E16 — Recepção operacional

| Feature | Status | Onde |
|---------|--------|------|
| Confirmação em lote | Done | ADR-011; `ReceptionOpsBoard` |
| Cadastro rápido de paciente | Done | ADR-011; `PatientFormDialog` variant `quick` |
| Tarefas internas / histórico de contatos | Later | Roadmap Later |

### E17 — Pré-consulta e portal

| Feature | Status | Onde |
|---------|--------|------|
| Formulários pré-consulta | Planned | Roadmap H3 |
| Portal do paciente | Planned | Roadmap H3 |

### E18 — Indicadores e IA

| Feature | Status | Onde |
|---------|--------|------|
| KPIs gerenciais (ocupação, no-show, retenção) | Planned | Roadmap H3 · E18 |
| Automações avançadas / IA clínica | Later | Roadmap H3+ · E18 |

## Reservado (E11)

### E11 — Inventário

| Feature | Status | Onde |
|---------|--------|------|
| Estoque | Deferred | módulo/schema vazios |

## Ver também

- [Épicos](Epicos)
- [Roadmap](Roadmap)
