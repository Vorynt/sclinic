# Domínio — Dashboard e Settings

**Módulos:** `dashboard`, `settings` · **Épico:** E8 (+ E7 no board)

## Dashboard

- `AppShell` (wash estático `bg-app-wash`), sidebar (`nav.ts`), homes por role (`HomeByRole`)
- Headers de listagem: `PageHeader` em `src/components/layout/`
- Homes: Owner, Admin, Manager, Receptionist (+ board com accent semântico), Doctor, Nurse, Financial, Default
- AttendanceShell separado (sem sidebar; **quieto** — só herda tokens, sem wash/orbs)
- Landing única em `/home`; diferenciação por `roleKey` (sem redirect pós-login por papel)

### Conteúdo por papel

| Papel | KPIs / resumos | Listas | Atalhos |
|-------|----------------|--------|---------|
| **owner** | Plano, cotas (users/profissionais), pacientes, agendamentos do mês, a receber / recebido | Roadmap “Primeiros passos” (até concluir) | Assinatura, Uso do plano, Equipe, Agenda, Ajuda |
| **admin** | Hoje, convites pendentes, equipe ativa, pacientes + fluxo do dia | Preview agenda | Equipe, Profissionais, Pacientes, Agenda |
| **manager** | Ocupação do dia (aguardando / em atendimento / concluídos) | Preview agenda | Pacientes, Profissionais, Agenda |
| **receptionist** | Contagens das 3 colunas do balcão | `ReceptionOpsBoard` (SSE) | Novo agendamento/paciente, Agenda |
| **clinician** | Contagens da **própria** agenda (self-filter no service) | Preview da própria agenda | Minha agenda, Pacientes |
| **nurse** | Fila clínica (ênfase em check-in) | Preview da própria agenda | Pacientes, Agenda |
| **financial** | A receber / recebido no mês | Cobranças pendentes (top 5) | Faturamento, Pacientes |

Widgets compartilhados: `HomeStatCards`, `HomeDayOpsStats`, `TodaysAppointmentsPreview`, `HomePendingChargesPreview`, `OwnerSetupRoadmap` (só owner). Dados vêm dos módulos de domínio (sem service próprio em `dashboard`).

### Roadmap de setup do owner (`OwnerSetupRoadmap`)

Tutorial pós-onboarding SaaS na `/home` do owner. Progresso **derivado** dos dados (profissional agendável, serviço ativo, paciente, ≥1 agendamento) — sem tabela de checklist.

| Missão | Obriga? | Desbloqueia agenda? | Critério |
|--------|---------|---------------------|----------|
| Cadastrar profissional | Sim (sem pular) | Sim | ≥1 profissional ativo para agenda (ou perfil clínico do owner) |
| Cadastrar serviço | Sim | Sim | ≥1 `clinic_services` ativo |
| Cadastrar paciente | Sim | Sim | ≥1 paciente |
| Primeiro agendamento | Sim (para sumir o card) | Não — *é* o uso da agenda | ≥1 appointment não cancelado; fica **bloqueada** até as 3 anteriores |

Quando as 4 estiverem concluídas, o card some. CTAs apontam para `/professionals`, `/settings/services`, `/patients`, `/appointments`.

## Settings

Shell fino em `/settings/*`; domínio real em clinics / audit / medical-records / billing.

| Rota | Gate extra |
|------|------------|
| general, hours, prescriptions | `settings.manage` |
| usage | owner |
| audit | `audit.read` |
| danger | exclusão clínica |

`/settings/prescriptions`: designer de templates (blocos empilhados, até 3) — UI em `medical-records` (ADR-008).

**ADR-009:** CRUD de serviços da clínica em `/settings/services` (`financial.manage`) — domínio em `billing`.

## Ajuda

Central de FAQ em `/help` (módulo `help`) — conteúdo **por papel**; ver [Dominio-Ajuda](Dominio-Ajuda). Item na sidebar + atalho Ajuda nas homes de todos os papéis.

## Decisão

Settings não vira “god module”: só navegação e composição de UIs de outros domínios.
