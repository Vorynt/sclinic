# Domínio — Agendamentos

**Módulo:** `src/modules/appointments/` · **Épicos:** E4, E7, E15, E16 · **ADR-006**, **ADR-009**, **ADR-011**

## Sumário

- [Responsabilidade](#responsabilidade)
- [Features](#features)
- [Workspace de atendimento](#workspace-de-atendimento)
- [Create — rápido vs completo](#create--rápido-vs-completo)
- [Máquina de status](#máquina-de-status)
- [Validações](#validações)
- [Modalidade](#modalidade-adr-011)
- [Horário do profissional](#horário-do-profissional-adr-011)
- [Bloqueio de horários](#bloqueio-de-horários-adr-011)
- [Lista de espera](#lista-de-espera-adr-011)
- [Cancelamento](#cancelamento)

## Responsabilidade

Calendário `/appointments`; create híbrido (rápido + completo); workspace `(attendance)`; transições de status.

## Features

- Calendário `/appointments` — **um round-trip por intervalo** (`getCalendarRangeAction`: agendamentos + bloqueios + horários da clínica quando a vista não é mês)
- Preferências de agenda da clínica (`clinic_calendar_settings`) em `/settings/calendar`: grade, tela inicial por papel e campos extras do card (presets recepção/gestão vs profissionais de saúde). Quem tem `settings.manage` chega lá pelo ícone de engrenagem na toolbar da agenda.
- Cards híbridos: faixa e superfície na cor do profissional; no calendário, `checked_in` aparece como **Iniciado**; na grade, o card sempre mostra status, paciente e horário; extras entram se a altura do bloco couber sem cortar; o caret só aparece se algum extra ficar de fora e, ao expandir, o card cresce no lugar com fundo sólido e rótulo no horário. Só um card expandido por vez.
- Vista mês agrupa eventos por dia no client (`groupAppointmentsByDay`); cada chip é uma linha (horário + paciente) e a expansão sobrepõe a grade sem esticar as células
- **Create híbrido:** agendamento rápido (modal) + completo (`/appointments/new`)
- Workspace `(attendance)`: cockpit notas-no-centro; vitais/documentos em sheet (`?panel=`)
- **Bootstrap do atendimento** (`getAttendanceBootstrapAction`): appointment + paciente + vitais atuais + histórico + última nota, e seed das query keys do rail/sheets — um loading cobre o contexto
- Transições de status + cancelamento
- Valor opcional → charge (ADR-002) — legado
- Serviço obrigatório + desconto % / cortesia (ADR-009) — Done
- Modalidade presencial/online, bloqueios de horário, horário do profissional e lista de espera (ADR-011) — Done

## Create — rápido vs completo

Espelha o padrão `PatientForm` (`quick` / `full`):

| Fluxo | UI | Campos | Entrypoints |
|-------|-----|--------|-------------|
| **Rápido** | `AppointmentFormDialog` → `AppointmentForm` `variant="quick"` | Paciente, profissional, data/hora/duração, tipo, modalidade, serviço (cobrança e motivo com defaults) | Clique em slot vazio; Agendar no paciente; home da recepção; promover waitlist; próximo atendimento |
| **Completo** | `/appointments/new` → `AppointmentNewPanel` + `variant="full"` `layout="page"` | Tudo do rápido + motivo, desconto/cobrança/override | Ação **Novo agendamento** na agenda; botão **Mais opções** no modal (leva draft via query params) |

- Helper: `buildAppointmentNewHref` / `appointmentNewLocationFromSearchParams` (`utils/appointment-new-href.ts`).
- Mesma action/service de create; edição continua no `AppointmentDetailDrawer` (remarcar / detalhes).
- Waitlist promote: modal rápido com `lockedPatient`; **Mais opções** preserva `waitlistId` + paciente na URL.

## Workspace de atendimento

Chrome isolado (`AttendanceShell`, sem AppShell). Landing `/appointments/[id]/attendance` abre o editor de evolução. Trilho persistente (idade, motivo, último vital, última nota). Vitais, documentos, ficha/alertas e retorno abrem em sheet/dialog (`?panel=vitals|documents|patient|next`) **sem desmontar** a nota. O workspace espera o **bootstrap** (não só o appointment) para montar o cockpit; o prefetch RSC hidrata as mesmas keys usadas pelos hooks do rail.

Rotas antigas `/notes`, `/vitals`, `/documents` e `/prescriptions` redirecionam para a landing (com `panel` quando couber) e preservam `mode`/`date` da agenda.

## Máquina de status

```
scheduled → confirmed (opcional)
scheduled|confirmed → checked_in (start) | no_show
checked_in → completed
qualquer ≠ canceled → canceled (action dedicada)
```

### Quem inicia / conclui atendimento

Só o profissional **responsável** pelo horário (`appointment.professionalId`), e apenas papéis `owner`, `admin`, `clinician`, `nurse`. Owner/admin sem perfil clínico, ou olhando a agenda de outra pessoa, só visualizam (com `records.read`). Recepcionista **não** inicia. Gestor lê o prontuário, mas não inicia nem conclui.

Cobertura: remarcar o profissional no agendamento; o substituto inicia.

### Quem abre / vê o workspace

Exige `records.read`. No drawer, **Abrir atendimento** / **Ver atendimento** só aparecem com essa permissão (gestor incluso; recepcionista e financeiro não). A rota `/appointments/[id]/attendance` também exige `records.read` + `appointments.create|update`.

### Editabilidade

- Remarcável: `scheduled|confirmed|checked_in` (exige `appointments.update`)
- Cancelar: action dedicada, exige `appointments.delete` (UI e service)
- Terminal: `completed|canceled|no_show`
- Attendance aberto também em `completed` (leitura, com `records.read`)

## Validações

- startsAt no futuro; endsAt > startsAt; duração ≤ 8h
- Tipos: consultation, follow_up, procedure, evaluation, other
- Dentro do horário da clínica (`clinic_business_hours` + timezone da clínica)
- Sem overlap com appointments ≠ `canceled` (inclui completed/no_show)
- Sem overlap com `schedule_blocks` (profissional ∪ clínica)
- Fora do expediente, consulta no mesmo horário ou bloqueio → erro distinto, cada um com até 3 `suggestedSlots` (próximos livres nos 14 dias, passo 30 min, no fuso da clínica)
- Self-schedule: clinician/nurse só a si (owner com perfil clínico **não** entra em self-schedule — vê a agenda completa)
- Assignee pode ser o owner se existir professional ativo vinculado ao seu `userId` (ADR-007)
- `amountCents` exige `financial.collect|manage` (legado até ADR-009)
- **ADR-009:** `serviceId` obrigatório em creates novos; desconto % e cortesia/retorno no form; override de valor só `financial.manage`

## Modalidade (ADR-011)

- Campo `modality` (`in_person` | `online`) em `appointments`, default `in_person`.
- `createAppointmentSchema` valida o enum; `listAppointmentsSchema` aceita filtro opcional.
- Agenda (`AppointmentsPanel`): filtros em drawer (lateral no desktop, inferior no mobile) com profissional, modalidade (tipo de agendamento) e paciente; busca nas listas; aplicar / restaurar padrões; indicador de filtro ativo e atalho Limpar fora do drawer.
- Cada evento mostra badge Presencial/Online quando o preset do card liga modalidade; online continua com ícone mesmo sem a flag.
- Preferências da grade (passo 15/30, domingo/segunda, ocultar cancelados) e dois presets de campos extras do card (recepção vs profissionais) vêm de `clinic_calendar_settings`. Status, paciente e horário sempre aparecem; extras só se o bloco for alto o suficiente para não cortar. Expandir (quando há extras de fora) cresce o card no lugar, com fundo sólido e rótulo no horário. Clinician/nurse usam o preset clínico; demais papéis com agenda usam operação. `?mode=` na URL vence a vista padrão. No celular, sem modo na URL, a agenda abre no dia. Quem tem `settings.manage` vê um atalho (engrenagem) na toolbar da agenda para `/settings/calendar`.

## Horário do profissional (ADR-011)

- `professional_business_hours` guarda o horário semanal por profissional (subconjunto do horário da clínica).
- Disponibilidade efetiva = interseção (`intersectMinuteIntervals`) entre horário da clínica e do profissional; sem configuração própria, usa só o horário da clínica.
- **Quem edita:** o próprio profissional (atalho “Meus horários” na home) ou quem tem `professionals.manage` (override em `/professionals`). Demais papéis só veem slots disponíveis na agenda.
- UI: `ProfessionalHoursDialog` (mesmo formulário semanal da clínica).

## Bloqueio de horários (ADR-011)

- `schedule_blocks`: indisponibilidade pontual (férias, reunião) sem criar um appointment "falso".
- `professionalId` **nullable** — `null` = bloqueio da clínica inteira (afeta disponibilidade de todos).
- Aparece na agenda como `ScheduleBlockEventCard`; clique abre remoção (`ScheduleBlockDetailDialog`).
- Impede novo agendamento e remarcação no intervalo (`hasOverlappingScheduleBlock` considera blocks do profissional **∪** clinic-wide). Mensagem ao usuário: “Este horário está bloqueado na agenda.”
- **Self-schedule:** clinician/nurse só criam/removem bloqueios da própria agenda; clinic-wide fica com recepção/gestores.
- CRUD: `ScheduleBlockFormDialog` (create) + detalhe/remoção no card.

## Lista de espera (ADR-011)

- `appointment_waitlist`: fila por paciente, com profissional/serviço opcionais e observações; status `waiting|promoted|canceled`.
- **Não reserva slot** — só ao promover (`waitlistService.promote`) é que um appointment real é criado via `appointmentService.create` (mesmas checagens de disponibilidade/horário).
- Guarda pura testável: `assertWaitlistPromotable` (só promove entrada `waiting`; paciente do agendamento deve ser o da fila).
- UI: `WaitlistPanel` na home da recepção; promoção abre `AppointmentFormDialog` (**quick**) com paciente travado (`lockedPatient`); **Mais opções** abre `/appointments/new` com draft + `waitlistId`.

> Disponibilidade = horário efetivo (clínica ∩ profissional) − bloqueios − conflitos de agenda. Horários recorrentes e agenda por sala/equipamento permanecem **Backlog H3 · E15** — ver [Roadmap](Roadmap).

## Cancelamento

Cancela charge `pending` automaticamente.

## Decisões relacionadas

ADR-006, ADR-009, ADR-011.

## Ver também

- [Recepção e realtime](Dominio-Recepcao-e-Realtime)
- [Faturamento clínico](Dominio-Faturamento-Clinico)
- [Profissionais](Dominio-Profissionais)
- [RBAC e permissões](RBAC-e-Permissoes)
- [Roadmap](Roadmap)
- [Índice de decisões](Indice-de-Decisoes)
