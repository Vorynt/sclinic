# Domínio — Faturamento clínico

**Módulo:** `billing` (subdomínio charges) · **Épico:** E6 · **ADR-002**, **ADR-009**, **ADR-011**

> Não confundir com [Assinatura SaaS](Dominio-Assinatura-SaaS).

## Features

- Criar charge (agenda / fluxo) — 1 ativa por appointment
- markPaid / cancel
- Listagem `/billing` (`financial.view`)
- Métodos manuais: cash, pix_manual, card, transfer, other (+ `courtesy` para cortesia/retorno)
- **Catálogo de serviços da clínica** (ADR-009) — CRUD em `/services`; precificação automática na agenda
- **Visão de inadimplentes** (ADR-011) — filtro `overdue` (somente vencidas) em `/billing`
- **Painel avançado** — KPIs, gráficos, filtros por período da consulta / serviço / tipo / forma de pagamento, exportação CSV e impressão

## Permissões

| Ação | Permissão |
|------|-----------|
| Cobrar / liquidar / cancelar charge | `financial.collect` **ou** `manage` |
| Ver lista `/billing` | `financial.view` |
| Ver catálogo `/services` | `financial.view` |
| CRUD serviços + override de valor | `financial.manage` |

## Regras

- Só `pending` → paid/canceled
- Cancelar appointment cancela charge pending (sem exigir collect)
- Campos `provider*` reservados para gateway futuro
- **ADR-009:**
  - Novo appointment exige `serviceId` do catálogo da clínica
  - Preço derivado do serviço; desconto % (0–100); override só com `manage`
  - Snapshot na charge: serviço, lista, desconto, líquido, `billingKind`
  - Cortesia / retorno → charge R$ 0 já `paid` + payment `courtesy`
  - Qualquer profissional usa o mesmo catálogo (sem vínculo a especialidade no MVP)

## Inadimplentes (ADR-011)

- `charges.dueAt` = fim do dia do agendamento no fuso da clínica (`endOfClinicLocalDay`, mesmo padrão `zonedWallTimeToUtc`/`getZonedDateTimeParts` do horário efetivo).
- `listChargesSchema.overdue` filtra `pending` com `dueAt < now()`.
- `chargeService.listDelinquentPatients` agrupa por paciente (total vencido, quantidade, vencimento mais antigo).
- UI: filtro **Somente vencidas** (`overdue`) na barra de filtros de `/billing`.

## Painel `/billing`

- Período, KPIs e o resumo visual usam `appointment.startsAt` no fuso da clínica. Sem `from`/`to` na URL = mês corrente; `all=1` = todo o período.
- Filtros ficam acima dos KPIs. Busca e presets de período ficam na barra; os demais (status, tipo, pagamento, serviço, vencidas, intervalo personalizado) abrem num Sheet (direita no desktop, bottom no mobile), no mesmo padrão da agenda.
- KPIs (novo `BillingInsights`, distinto do summary da home): recebido, a receber, inadimplente, ticket médio.
- Filtros na URL (`nuqs`): `q`, `status`, `overdue`, `from`, `to`, `all`, `serviceId`, `kind`, `method`, `patientId`.
- Exportação CSV e impressão (`/billing/print`) respeitam o mesmo recorte; teto de 2000 linhas (`EXPORT_LIMIT_EXCEEDED`). A listagem de impressão é carregada só em `/billing/print` (não no painel). O relatório traz nome da clínica, marca sclinic no cabeçalho e os filtros ativos.
- Home financeira continua no `getBillingSummaryAction` (pending global + pago no mês UTC).

## Schema

`clinic_services` + `charges` / `payments` em `src/db/schema/`; services `clinic-service.service.ts` / `charge.service.ts`. Campo `charges.due_at` (ADR-011).

## Decisões relacionadas

ADR-002, ADR-009, ADR-011.

## Ver também

- [Assinatura SaaS](Dominio-Assinatura-SaaS)
- [Agendamentos](Dominio-Agendamentos)
- [RBAC e permissões](RBAC-e-Permissoes)
- [Índice de decisões](Indice-de-Decisoes)
