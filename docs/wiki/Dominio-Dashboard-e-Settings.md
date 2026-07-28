# Domínio — Dashboard e Settings

**Módulos:** `dashboard`, `settings` · **Épico:** E8 (+ E7 no board)

## Dashboard

- `AppShell`, sidebar (`nav.ts`), homes por role (`HomeByRole`)
- Homes: Owner, Admin, Manager, Receptionist (+ board), Doctor, Nurse, Financial, Default
- AttendanceShell separado (sem sidebar completa)
- Landing única em `/home`; diferenciação por `roleKey` (sem redirect pós-login por papel)

### Conteúdo por papel

| Papel | KPIs / resumos | Listas | Atalhos |
|-------|----------------|--------|---------|
| **owner** | Plano, cotas (users/profissionais), pacientes, agendamentos do mês, a receber / recebido | — | Assinatura, Uso do plano, Equipe, Agenda |
| **admin** | Hoje, convites pendentes, equipe ativa, pacientes + fluxo do dia | Preview agenda | Equipe, Profissionais, Pacientes, Agenda |
| **manager** | Ocupação do dia (aguardando / em atendimento / concluídos) | Preview agenda | Pacientes, Profissionais, Agenda |
| **receptionist** | Contagens das 3 colunas do balcão | `ReceptionOpsBoard` (SSE) | Novo agendamento/paciente, Agenda |
| **doctor** | Contagens da **própria** agenda (self-filter no service) | Preview da própria agenda | Minha agenda, Pacientes |
| **nurse** | Fila clínica (ênfase em check-in) | Preview da própria agenda | Pacientes, Agenda |
| **financial** | A receber / recebido no mês | Cobranças pendentes (top 5) | Faturamento, Pacientes |

Widgets compartilhados: `HomeStatCards`, `HomeDayOpsStats`, `TodaysAppointmentsPreview`, `HomePendingChargesPreview`. Dados vêm dos módulos de domínio (sem service próprio em `dashboard`).

## Settings

Shell fino em `/settings/*`; domínio real em clinics / audit / medical-records / billing.

| Rota | Gate extra |
|------|------------|
| general, hours, prescriptions | `settings.manage` |
| usage | owner |
| audit | `audit.read` |
| danger | exclusão clínica |

`/settings/prescriptions`: designer de templates (blocos empilhados, até 3) — UI em `medical-records` (ADR-008).

## Decisão

Settings não vira “god module”: só navegação e composição de UIs de outros domínios.
