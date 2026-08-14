# Domínio — Faturamento clínico

**Módulo:** `billing` (subdomínio charges) · **Épico:** E6 · **ADR-002**, **ADR-009**, **ADR-011**

> Não confundir com [Assinatura SaaS](Dominio-Assinatura-SaaS).

## Features

- Criar charge (agenda / fluxo) — 1 ativa por appointment
- markPaid / cancel
- Listagem `/billing` (`financial.view`)
- Métodos manuais: cash, pix_manual, card, transfer, other (+ `courtesy` para cortesia/retorno)
- **Catálogo de serviços da clínica** (ADR-009) — CRUD em `/settings/services`; precificação automática na agenda
- **Visão de inadimplentes** (ADR-011) — cobranças `pending` vencidas, agrupadas por paciente

## Permissões

| Ação | Permissão |
|------|-----------|
| Cobrar / liquidar / cancelar charge | `financial.collect` **ou** `manage` |
| Ver lista `/billing` | `financial.view` |
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
- UI: aba **Inadimplentes** em `/billing` (`BillingPanel` + `DelinquentPatientsList`), ao lado da listagem normal de cobranças.

## Schema

`clinic_services` + `charges` / `payments` em `src/db/schema/`; services `clinic-service.service.ts` / `charge.service.ts`. Campo `charges.due_at` (ADR-011).
