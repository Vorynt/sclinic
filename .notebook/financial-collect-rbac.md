# financial.collect — cobrança no fluxo de agenda

## Decisão

Permissão `financial.collect` para criar cobrança ligada a agendamento e marcar pago/cancelar, sem abrir a listagem `/billing` (`financial.view`).

Papéis: receptionist, doctor, manager (+ owner/admin/financial).

## Ops

Após deploy em ambientes já seedados:

```bash
npm run db:seed:rbac
```

(ou re-seed demo se for ambiente de demonstração).
