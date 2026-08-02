# Domínio — Agendamentos

**Módulo:** `src/modules/appointments/` · **Épicos:** E4, E7 · **ADR-006**, **ADR-009**

## Features

- Calendário `/appointments`
- Workspace `(attendance)` com notas/vitais/receitas
- Transições de status + cancelamento
- Valor opcional → charge (ADR-002) — legado
- Serviço obrigatório + desconto % / cortesia (ADR-009) — Done

## Máquina de status

```
scheduled → confirmed (opcional)
scheduled|confirmed → checked_in (start) | no_show
checked_in → completed
qualquer ≠ canceled → canceled (action dedicada)
```

### Quem inicia atendimento

Só `owner`, `admin`, `doctor`, `nurse`. Recepcionista **não** inicia.

### Editabilidade

- Remarcável: `scheduled|confirmed|checked_in`
- Terminal: `completed|canceled|no_show`
- Attendance aberto também em `completed` (leitura)

## Validações

- startsAt no futuro; endsAt > startsAt; duração ≤ 8h
- Tipos: consultation, follow_up, procedure, evaluation, other
- Dentro do horário da clínica
- Sem overlap com appointments ≠ `canceled` (inclui completed/no_show)
- Self-schedule: doctor/nurse só a si (owner com perfil clínico **não** entra em self-schedule — vê a agenda completa)
- Assignee pode ser o owner se existir professional ativo vinculado ao seu `userId` (ADR-007)
- `amountCents` exige `financial.collect|manage` (legado até ADR-009)
- **ADR-009:** `serviceId` obrigatório em creates novos; desconto % e cortesia/retorno no form; override de valor só `financial.manage`

## Cancelamento

Cancela charge `pending` automaticamente.
