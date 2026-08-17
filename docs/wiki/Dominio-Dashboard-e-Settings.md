# Domínio — Dashboard e Settings

**Módulos:** `dashboard`, `settings` · **Épico:** E8 (+ E7 no board)

## Sumário

- [Dashboard](#dashboard)
- [Settings](#settings)
- [Ajuda](#ajuda)

## Dashboard

- `AppShell` (wash estático `bg-app-wash`), shell híbrido sem sidebar: top nav (desktop) + bottom tabs (mobile) via `nav.ts`, homes por role (`HomeByRole`)
- Headers de listagem: `PageHeader` em `src/components/layout/`
- Homes: Owner, Admin, Manager, Receptionist (+ board com accent semântico), Doctor, Nurse, Financial, Default
- AttendanceShell separado (sem nav de módulos; **quieto** — só herda tokens, sem wash/orbs)
- Landing única em `/home`; diferenciação por `roleKey` (sem redirect pós-login por papel)

### Navegação do shell

| Camada | Destinos | Onde aparece |
|--------|----------|--------------|
| Primária | Início, Agendamentos, Pacientes | Top nav (md+) e bottom tabs (mobile) |
| Overflow (“Mais”) | Profissionais, Equipe, Faturamento | Dropdown no desktop; sheet no mobile |
| Utilitária | Configurações, Ajuda | Dentro do overflow |

Itens sem permissão continuam filtrados por `getVisibleShellNav` / `canAny`. Header do shell sem título de página (já vem do `PageHeader` / `SettingsPageHeader`). Tema fica no menu da conta. Shell em `h-dvh` com main scrollável; bottom tabs **no fluxo** (não `fixed`) para não cobrir conteúdo no mobile.

### Ações de página (mobile FAB)

`PageHeader` recebe `PageAction[]` declarativas (não `ReactNode`). No desktop renderiza botões no header; no mobile registra em `page-actions.store` e o `AppShell` exibe `PageActionsFab`:

| Quantidade | Comportamento |
|------------|---------------|
| 1 | Um FAB grande (primária) |
| 2+ | Secundárias menores empilhadas acima; primária maior embaixo |

Primária = `priority: "primary"` ou, se omitido, a **última** ação da lista. Evita botões soltos quebrando o header no mobile.

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

Central de FAQ em `/help` (módulo `help`) — conteúdo **por papel**; ver [Dominio-Ajuda](Dominio-Ajuda). Item Ajuda no overflow da nav + atalho Ajuda nas homes de todos os papéis. Tour guiado no primeiro acesso ao `AppShell` (âncoras `data-tour` na chrome; passos filtrados pela nav visível).

## Decisões relacionadas

Settings não vira “god module”: só navegação e composição de UIs de outros domínios.

## Ver também

- [Ajuda](Dominio-Ajuda)
- [Recepção e realtime](Dominio-Recepcao-e-Realtime)
- [Rotas e navegação](Rotas-e-Navegacao)
- [RBAC e permissões](RBAC-e-Permissoes)
- [Auditoria](Dominio-Auditoria)
