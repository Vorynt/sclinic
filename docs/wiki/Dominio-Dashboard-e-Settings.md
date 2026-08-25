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
| Primária | Até 3 destinos permitidos, na ordem do config (Início → Agendamentos → Pacientes → Profissionais → Equipe → Serviços → Faturamento → Configurações → Ajuda). Se o overflow teria só 1 item, ele também entra aqui (4º) | Top nav (md+) e bottom tabs (mobile) |
| Overflow (“Mais”) | O restante após os 3 slots, **somente se houver 2+ destinos** | Dropdown no desktop; sheet no mobile |

`getVisibleShellNav` filtra por permissão/`enabled` e **preenche** os 3 slots primários com os próximos destinos visíveis (ex.: financeiro sem agenda vê Início, Pacientes, Serviços + Mais com Faturamento e Ajuda). Item promovido não duplica no overflow. Um único restante (ex.: recepção: só Ajuda) aparece na primária — “Mais” some. Header do shell sem título de página (já vem do `PageHeader` / `SettingsPageHeader`). Tema fica no menu da conta. Shell em `h-dvh` com main scrollável; bottom tabs **no fluxo** (não `fixed`) para não cobrir conteúdo no mobile.

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
| **receptionist** | Contagens no header das 3 colunas do board (sem cards de resumo) | `ReceptionOpsBoard` (SSE) + lista de espera | Novo agendamento/paciente (header / FAB) |
| **clinician** | Contagens da **própria** agenda (self-filter no service) | Preview da própria agenda | Minha agenda, Pacientes |
| **nurse** | Fila clínica (ênfase em check-in) | Preview da própria agenda | Pacientes, Agenda |
| **financial** | A receber / recebido no mês | Cobranças pendentes (top 5) | Faturamento, Serviços, Pacientes |

Widgets compartilhados: `HomeStatCards`, `HomeDayOpsStats`, `TodaysAppointmentsPreview`, `HomePendingChargesPreview`, `OwnerSetupRoadmap` (só owner). A home **compõe** dados no `dashboardService` (`getOwnerHomeStats`, `getAdminHomeStats`, `getReceptionDayBoard`) chamando **services públicos** dos módulos — counts reais, sem listar 100 membros ou `pageSize: 1` só para ler `total`. Cota do plano continua no shell (`useClinicPlanQuota`); a home do owner não refetch de cota. As páginas `/home`, `/appointments` e o layout de atendimento fazem `prefetchQuery` + `HydrationBoundary` (com `setQueryClinicId` antes, porque o hash da query inclui a clínica).

### Roadmap de setup do owner (`OwnerSetupRoadmap`)

Tutorial pós-onboarding SaaS na `/home` do owner. Progresso **derivado** dos dados (profissional agendável, serviço ativo, paciente, ≥1 agendamento) — sem tabela de checklist.

| Missão | Obriga? | Desbloqueia agenda? | Critério |
|--------|---------|---------------------|----------|
| Cadastrar profissional | Sim (sem pular) | Sim | ≥1 profissional ativo para agenda (ou perfil clínico do owner) |
| Cadastrar serviço | Sim | Sim | ≥1 `clinic_services` ativo |
| Cadastrar paciente | Sim | Sim | ≥1 paciente |
| Primeiro agendamento | Sim (para sumir o card) | Não — *é* o uso da agenda | ≥1 appointment não cancelado; fica **bloqueada** até as 3 anteriores |

Quando as 4 estiverem concluídas, o card some. CTAs apontam para `/professionals`, `/services`, `/patients`, `/appointments`.

## Settings

Shell fino em `/settings/*`; domínio real em clinics / audit / medical-records.

| Rota | Gate extra |
|------|------------|
| general, hours, calendar, prescriptions | `settings.manage` |
| usage | owner |
| audit | `audit.read` |
| danger | exclusão clínica |

`/settings/prescriptions`: designer de templates (blocos empilhados, até 3, cor de destaque) — UI em `medical-records` (ADR-008).

`/settings/calendar`: grade, tela inicial e campos extras do card por papel — persistência em `clinics` (`clinic_calendar_settings`); UI em `appointments`. Quem tem `settings.manage` também chega pela engrenagem na toolbar de `/appointments`.

Catálogo de serviços (ADR-009) vive em `/services` (`financial.view` para ler; `financial.manage` para CRUD) — domínio em `billing`. `/settings/services` redireciona para `/services`.

## Ajuda

Central de FAQ em `/help` (módulo `help`) — conteúdo **por papel**; ver [Dominio-Ajuda](Dominio-Ajuda). Ajuda entra no overflow só quando há 2+ destinos restantes; senão aparece na primária. Atalho Ajuda nas homes de todos os papéis. Tour guiado no primeiro acesso ao `AppShell` (âncoras `data-tour` na chrome; passos filtrados pela nav visível).

## Decisões relacionadas

Settings não vira “god module”: só navegação e composição de UIs de outros domínios.

## Ver também

- [Ajuda](Dominio-Ajuda)
- [Recepção e realtime](Dominio-Recepcao-e-Realtime)
- [Rotas e navegação](Rotas-e-Navegacao)
- [RBAC e permissões](RBAC-e-Permissoes)
- [Auditoria](Dominio-Auditoria)
