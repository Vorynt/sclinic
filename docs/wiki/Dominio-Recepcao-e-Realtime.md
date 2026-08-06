# Domínio — Recepção e realtime

**Módulos:** `dashboard` (board), `appointments` (waitlist), `core/realtime`, API SSE · **Épicos:** E7, E16 · **ADR-006**, **ADR-011**

## Board operacional

Visível na home do **receptionist** (`ReceptionOpsBoard`).

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
- **Promover**: abre `AppointmentFormDialog` com o paciente travado; ao confirmar, roda todas as checagens normais de disponibilidade antes de criar o agendamento e marcar a entrada `promoted`.
- **Remover**: cancela a entrada (`canceled`) sem side-effects na agenda.

## Cadastro rápido de paciente (ADR-011)

- `PatientFormDialog` aceita `variant="quick"` (nome, CPF, telefone) para os fluxos de balcão (novo paciente na home da recepção e criação inline no formulário de agendamento/lista de espera).
- Mesmo schema (`createPatientSchema`) — os demais campos continuam opcionais e podem ser completados depois em `/patients`.

## Fluxo canônico

1. Agenda (+ valor) → charge pending  
2. Profissional de saúde inicia e conclui **sem** UI de pagamento  
3. Board → Receber (`financial.collect|manage`)  
4. SSE invalida queries (agendamentos, bloqueios, lista de espera, cobranças)

## Realtime

- `GET /api/realtime/clinic` → evento `clinic.ops`
- Hub **in-process** (limitação multi-instância documentada no ADR)
- Entidades: `appointment`, `charge`, `waitlist`
- Próximo: broker (ver [Roadmap](Roadmap))

## Decisão

Separar papel clínico do caixa; board derivado (sem status novo de appointment).
