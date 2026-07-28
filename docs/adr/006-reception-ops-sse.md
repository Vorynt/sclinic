# ADR-006: Fluxo operacional da recepção + SSE

- **Date**: 2026-07-28
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, appointments, billing, reception, realtime

## Context and Problem Statement

Clínicas com recepcionista marcam a consulta, o profissional atende e o paciente paga no balcão. O produto ainda acopla cobrança ao “concluir atendimento” do médico e não tem visão operacional do dia nem sincronização entre estações. Precisamos fechar o fluxo canônico e um canal realtime escalável para o painel da recepção.

## Decision Drivers

- Separar papel clínico (atender/concluir) do papel de caixa (liquidar charge)
- Reusar charge 1:1 por appointment (ADR-002) sem status novo de appointment
- Painel da recepção derivado de `status` + charge (`pending` / `paid`)
- Realtime cedo (não só polling) com contrato estável para multi-estação
- Fluxo Action → Service → Repository; eventos via `core/events` / `core/realtime`

## Considered Options

- Médico cobra ao concluir; recepção só agenda (status quo)
- Polling no board da recepção (5–10s) sem push
- SSE por `clinicId` com hub in-process + ponto de extensão para broker
- WebSocket / Pusher / Ably desde o MVP

## Decision Outcome

Chosen option: **"Fluxo balcão + board derivado + SSE por clínica"**.

### Fluxo canônico

1. Agendamento (recepção/profissional) com valor → cria `appointment` + charge `pending`
2. Profissional inicia (`checked_in`) e conclui (`completed`) **sem** UI de pagamento
3. Paciente vai à recepção; board mostra “Aguardando pagamento”
4. Recepção liquida (`markPaid`) com `financial.collect`
5. Cancelar appointment cancela charge `pending` automaticamente

### Board da recepção (visão composta)

| Coluna | Regra |
|--------|--------|
| Próximos | `scheduled` / `confirmed` do dia |
| Em atendimento | `checked_in` |
| Aguardando pagamento | `completed` + charge `pending` |

Escape hatch: marcar pago no drawer da agenda (consultório solo).

### Realtime

- Endpoint SSE autenticado (`GET /api/realtime/clinic`)
- Domínio publica `clinic.ops.changed` após create/status/cancel de appointment e create/paid/cancel de charge
- Client (`EventSource`) invalida queries do board / agenda
- Hub **in-process** no MVP; multi-instância exige broker (ex.: Redis/Upstash) **atrás do mesmo contrato SSE** — o browser não muda

### Positive Consequences

- Caixa na recepção; médico foca no clínico
- Board sem novos enums de appointment
- SSE preparado para escalar trocando só o fan-out

### Negative Consequences

- Hub in-memory não cruza isolates serverless até haver broker
- Conexões SSE longas pedem runtime Node + `maxDuration` adequado no deploy
- Charge no book continua dependente de informar valor + `financial.collect` (catálogo de preços fica para depois)

## Pros and Cons of the Options

### Fluxo balcão + SSE ✅ Chosen

- ✅ Alinha com operação real de clínica
- ✅ Contrato SSE estável; broker depois
- ❌ Custo operacional de conexões longas / multi-instância

### Status quo (médico cobra)

- ✅ Já implementado em parte
- ❌ Não serve clínica com recepção

### Só polling

- ✅ Simples em serverless
- ❌ Atrasa percepção no balcão; pior UX multi-estação

### WebSocket / SaaS realtime no MVP

- ✅ Push maduro
- ❌ Dependência externa cedo demais para o volume atual

## Links

- [ADR-002 — faturamento clínico](./002-clinical-billing.md)
- `src/core/realtime/`
- `src/app/api/realtime/clinic/route.ts`
- `src/modules/dashboard/components/home/ReceptionistHome.tsx`
