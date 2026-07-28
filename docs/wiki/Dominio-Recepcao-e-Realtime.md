# Domínio — Recepção e realtime

**Módulos:** `dashboard` (board), `core/realtime`, API SSE · **Épico:** E7 · **ADR-006**

## Board operacional

Visível na home do **receptionist** (`ReceptionOpsBoard`).

| Coluna | Regra |
|--------|--------|
| Próximos | scheduled \| confirmed (hoje) |
| Em atendimento | checked_in |
| Aguardando pagamento | completed + charge pending |

Fora do board: canceled, no_show, completed sem charge ou paid.

## Fluxo canônico

1. Agenda (+ valor) → charge pending  
2. Médico inicia e conclui **sem** UI de pagamento  
3. Board → Receber (`financial.collect|manage`)  
4. SSE invalida queries

## Realtime

- `GET /api/realtime/clinic` → evento `clinic.ops`
- Hub **in-process** (limitação multi-instância documentada no ADR)
- Próximo: broker (ver [Roadmap](Roadmap))

## Decisão

Separar papel clínico do caixa; board derivado (sem status novo de appointment).
