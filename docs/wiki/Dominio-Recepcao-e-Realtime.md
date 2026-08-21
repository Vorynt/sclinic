# Domínio — Recepção e realtime

**Módulos:** `dashboard` (board), `appointments` (waitlist), `core/realtime`, API SSE · **Épicos:** E7, E16 · **ADR-006**, **ADR-011**

## Board operacional

Visível na home do **receptionist** (`ReceptionOpsBoard`). Layout da home: saudação com **Novo paciente** / **Novo agendamento** (header no desktop, FAB no mobile); contagem no header de cada coluna do board; `WaitlistPanel` abaixo. Sem cards de KPI nem seção de ações rápidas.

| Coluna | Regra |
|--------|--------|
| Próximos | scheduled \| confirmed (hoje) |
| Em atendimento | checked_in |
| Aguardando pagamento | completed + charge pending |

Fora do board: canceled, no_show, completed sem charge ou paid.

### Confirmação em lote (ADR-011)

- Coluna "Próximos" ganha checkbox por agendamento `scheduled`; botões **Confirmar selecionados** e **Confirmar todos do dia**.
- Action `confirmAppointmentsBatchAction` → `appointmentService.confirmBatch` (1–100 ids); cada item só confirma se ainda `scheduled` (self-schedule só confirma os próprios) — demais são silenciosamente ignorados e contam em `skippedCount`.
- Publica `clinic.ops` por agendamento confirmado; UI mostra `confirmedCount`/`skippedCount` no toast.

## Lista de espera (ADR-011)

- `WaitlistPanel` na home da recepção lista entradas `waiting` (paciente, profissional/serviço opcionais, observações, tempo de espera).
- **Adicionar**: dialog com combobox de paciente (+ cadastro rápido), profissional e serviço opcionais.
- **Promover**: abre `AppointmentFormDialog` (**novo agendamento**) com o paciente travado; ao confirmar, roda todas as checagens normais de disponibilidade antes de criar o agendamento e marcar a entrada `promoted`. **Mais opções** leva para `/appointments/new` (motivo + cobrança) preservando `waitlistId`.
- **Remover**: cancela a entrada (`canceled`) sem side-effects na agenda.

## Cadastro rápido de paciente (ADR-011)

- `PatientFormDialog` aceita `variant="quick"` (nome, CPF, telefone) para os fluxos de balcão (novo paciente na home da recepção e criação inline no formulário de agendamento/lista de espera).
- Mesmo schema (`createPatientSchema`) — os demais campos continuam opcionais e podem ser completados depois em `/patients`.

## Agendamento rápido (UI)

- Ação **Novo agendamento** na home da recepção (header / FAB) abre o modal quick (paciente, horário, tipo, modalidade e serviço).
- Para motivo e cobrança: **Mais opções** → `/appointments/new`.

## Fluxo canônico

1. Agenda (+ valor) → charge pending  
2. Profissional de saúde inicia e conclui **sem** UI de pagamento  
3. Board → Receber (`financial.collect|manage`)  
4. SSE invalida queries (agendamentos, bloqueios, lista de espera, cobranças)

## Realtime

- `GET /api/realtime/clinic` → evento `clinic.ops`
- Hub **in-process** (limitação multi-instância documentada no ADR)
- Entidades: `appointment`, `charge`, `waitlist`
- `useClinicOpsRealtime` debounced (~400ms) invalida prefixes `appointments` / `schedule-blocks` / `waitlist` / `charges` — colapsa rajadas de eventos numa única onda de refetch
- Próximo: broker (ver [Roadmap](Roadmap))

## Decisões relacionadas

Separar papel clínico do caixa; board derivado (sem status novo de appointment).

## Ver também

- [Agendamentos](Dominio-Agendamentos)
- [Dashboard e settings](Dominio-Dashboard-e-Settings)
- [Faturamento clínico](Dominio-Faturamento-Clinico)
- [Roadmap](Roadmap)
- [Índice de decisões](Indice-de-Decisoes)
