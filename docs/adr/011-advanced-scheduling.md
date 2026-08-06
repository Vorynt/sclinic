# ADR-011: Agenda avançada (bloqueios, horário do profissional, lista de espera, modalidade)

- **Date**: 2026-08-04
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, appointments, professionals, scheduling, reception
- **Extends**: ADR-006 (recepção + SSE), ADR-009 (serviço no appointment)
- **Roadmap**: H2 · E15

## Context and Problem Statement

A agenda MVP (E4) usa só o expediente da clínica + overlap de appointments no profissional. A recepção ainda depende de planilha para: indisponibilidade pontual (férias/reunião), horário individual do profissional, fila de espera/encaixe e filtro presencial/online. Precisamos estender o modelo sem inventar “appointment falso” nem quebrar a availability atual.

## Decision Drivers

- Fluxo Action → Service → Repository; módulos `appointments` e `professionals`
- Disponibilidade única: create/reschedule e sugestões de slot devem ver a mesma fonte de busy/hours
- Horário do profissional = subconjunto do expediente da clínica (já previsto no domínio)
- Sem recorrência, salas/equipamento, WhatsApp ou hold de slot nesta fatia (H3 / fora)
- Mudança mínima; reusar SSE (`publishClinicOps`) para invalidar listas na recepção

## Considered Options

- Bloqueios como appointments com `type` especial
- Horário do profissional só no client (sem schema)
- Waitlist embutida em notes / status do paciente
- Modalidade só como tag livre em `notes`

## Decision Outcome

Chosen option: **entidades/colunas dedicadas + interseção de horas + promote explícito**, because preserva a máquina de status de appointments, evita dual semantics e alinha com o backlog H2.

### Regras

| Tema | Decisão |
|------|--------|
| Bloqueios | Tabela `schedule_blocks`: `clinicId`, `professionalId` (**nullable** = clínica inteira), `startsAt`/`endsAt`, `reason` opcional, soft-delete. Contam como busy na availability (junto com appointments ≠ `canceled`). Self-schedule (doctor/nurse): só cria/remove o próprio; clinic-wide só operação/gestão |
| Horário do profissional | Tabela `professional_business_hours` (mesmo shape de `clinic_business_hours`). Janela efetiva = **interseção** clinic ∩ professional. Sem rows = herda 100% o expediente da clínica |
| Ownership do horário | CRUD no módulo `professionals`; `appointments` consome via service público (sem cross-import de internals) |
| Lista de espera | Tabela `appointment_waitlist`: patient, professional opcional, service opcional, notes, status `waiting` \| `promoted` \| `canceled`. **Não** reserva slot até o promote |
| Promote / encaixe | Cria appointment (reusa `appointmentService.create` + availability) e marca waitlist `promoted` |
| Modalidade | Enum `appointment_modality`: `in_person` (default) \| `online` em `appointments`; filtro na listagem/calendário |
| Realtime | Mutações de blocks/waitlist publicam `clinic.ops` (ADR-006) |
| Permissões | Alinhadas a quem já agenda (`appointments.*`); leitura na recepção |

### Fora deste ADR

Horários recorrentes, agenda por sala/equipamento, reagendamento em massa, hold/reserva temporária de slot, confirmação em lote e visão de inadimplentes (extensões ADR-006 / ADR-002 no mesmo horizonte H2, sem ADR próprio).

### Positive Consequences

- Availability permanece uma única porta (`professionalAvailabilityService`)
- Bloqueios não poluem a máquina de status nem o board de recepção
- Waitlist operacional sem “fantasma” de slot ocupado
- Modalidade tipada e filtrável sem parse de notes

### Negative Consequences

- Mais tabelas e migrations no núcleo da agenda
- Interseção de horas exige cuidado no grid (1 profissional vs “todos”)
- Waitlist sem hold pode ter corrida no promote (resolvida pela availability no create)

## Pros and Cons of the Options

### Appointment falso para bloqueio

- ✅ Reusa UI do calendário
- ❌ Contamina status/board/charges; overlap semântico
- ❌ Rejeitado

### Entidade `schedule_blocks` ✅ Chosen

- ✅ Busy limpo; UI distinta
- ❌ Schema extra

### Horário só no client

- ❌ Não enforça no server; diverge de suggested slots

### `professional_business_hours` + interseção ✅ Chosen

- ✅ Compatível com “sem rows = clinic hours”
- ✅ Espelha padrão já usado em clinics

## Links

- [ADR-006 — Recepção + SSE](./006-reception-ops-sse.md)
- [ADR-009 — Catálogo de serviços](./009-clinic-services-catalog.md)
- [Roadmap H2 · E15](../wiki/Roadmap.md)
- `src/modules/appointments/services/professional-availability.service.ts`
- `src/db/schema/clinic-hours.ts`
