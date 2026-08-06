# Domínio — Agendamentos

**Módulo:** `src/modules/appointments/` · **Épicos:** E4, E7, E15, E16 · **ADR-006**, **ADR-009**, **ADR-011**

## Features

- Calendário `/appointments`
- Workspace `(attendance)` com notas/vitais/receitas
- Transições de status + cancelamento
- Valor opcional → charge (ADR-002) — legado
- Serviço obrigatório + desconto % / cortesia (ADR-009) — Done
- Modalidade presencial/online, bloqueios de horário, horário do profissional e lista de espera (ADR-011) — Done

## Máquina de status

```
scheduled → confirmed (opcional)
scheduled|confirmed → checked_in (start) | no_show
checked_in → completed
qualquer ≠ canceled → canceled (action dedicada)
```

### Quem inicia atendimento

Só `owner`, `admin`, `clinician`, `nurse`. Recepcionista **não** inicia.

### Editabilidade

- Remarcável: `scheduled|confirmed|checked_in`
- Terminal: `completed|canceled|no_show`
- Attendance aberto também em `completed` (leitura)

## Validações

- startsAt no futuro; endsAt > startsAt; duração ≤ 8h
- Tipos: consultation, follow_up, procedure, evaluation, other
- Dentro do horário da clínica (`clinic_business_hours` + timezone da clínica)
- Sem overlap com appointments ≠ `canceled` (inclui completed/no_show)
- Fora do expediente ou conflito → erro com até 3 `suggestedSlots` (próximos livres nos 14 dias, passo 30 min, no fuso da clínica)
- Self-schedule: clinician/nurse só a si (owner com perfil clínico **não** entra em self-schedule — vê a agenda completa)
- Assignee pode ser o owner se existir professional ativo vinculado ao seu `userId` (ADR-007)
- `amountCents` exige `financial.collect|manage` (legado até ADR-009)
- **ADR-009:** `serviceId` obrigatório em creates novos; desconto % e cortesia/retorno no form; override de valor só `financial.manage`

## Modalidade (ADR-011)

- Campo `modality` (`in_person` | `online`) em `appointments`, default `in_person`.
- `createAppointmentSchema` valida o enum; `listAppointmentsSchema` aceita filtro opcional.
- Agenda (`AppointmentsPanel`): filtros em drawer (lateral no desktop, inferior no mobile) com profissional, modalidade (tipo de agendamento) e paciente; busca nas listas; aplicar / restaurar padrões; indicador de filtro ativo e atalho Limpar fora do drawer.
- Cada evento mostra badge Presencial/Online.

## Horário do profissional (ADR-011)

- `professional_business_hours` guarda o horário semanal por profissional (subconjunto do horário da clínica).
- Disponibilidade efetiva = interseção (`intersectMinuteIntervals`) entre horário da clínica e do profissional; sem configuração própria, usa só o horário da clínica.
- **Quem edita:** o próprio profissional (atalho “Meus horários” na home) ou quem tem `professionals.manage` (override em `/professionals`). Demais papéis só veem slots disponíveis na agenda.
- UI: `ProfessionalHoursDialog` (mesmo formulário semanal da clínica).

## Bloqueio de horários (ADR-011)

- `schedule_blocks`: indisponibilidade pontual (férias, reunião) sem criar um appointment "falso".
- `professionalId` **nullable** — `null` = bloqueio da clínica inteira (afeta disponibilidade de todos).
- Aparece na agenda como `ScheduleBlockEventCard`; clique abre remoção (`ScheduleBlockDetailDialog`).
- Impede novo agendamento no intervalo (`hasOverlappingScheduleBlock` considera blocks do profissional **∪** clinic-wide).
- **Self-schedule:** clinician/nurse só criam/removem bloqueios da própria agenda; clinic-wide fica com recepção/gestores.
- CRUD: `ScheduleBlockFormDialog` (create) + detalhe/remoção no card.

## Lista de espera (ADR-011)

- `appointment_waitlist`: fila por paciente, com profissional/serviço opcionais e observações; status `waiting|promoted|canceled`.
- **Não reserva slot** — só ao promover (`waitlistService.promote`) é que um appointment real é criado via `appointmentService.create` (mesmas checagens de disponibilidade/horário).
- Guarda pura testável: `assertWaitlistPromotable` (só promove entrada `waiting`; paciente do agendamento deve ser o da fila).
- UI: `WaitlistPanel` na home da recepção; promoção abre `AppointmentFormDialog` com paciente travado (`lockedPatient`).

> Disponibilidade = horário efetivo (clínica ∩ profissional) − bloqueios − conflitos de agenda. Horários recorrentes e agenda por sala/equipamento permanecem **Backlog H3 · E15** — ver [Roadmap](Roadmap).

## Cancelamento

Cancela charge `pending` automaticamente.
