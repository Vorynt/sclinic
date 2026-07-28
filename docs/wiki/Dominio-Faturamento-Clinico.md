# Domínio — Faturamento clínico

**Módulo:** `billing` (subdomínio charges) · **Épico:** E6 · **ADR-002**

> Não confundir com [Assinatura SaaS](Dominio-Assinatura-SaaS).

## Features

- Criar charge (agenda / fluxo) — 1 ativa por appointment
- markPaid / cancel
- Listagem `/billing` (`financial.view`)
- Métodos manuais: cash, pix_manual, card, transfer, other

## Permissões

| Ação | Permissão |
|------|-----------|
| Cobrar / liquidar / cancelar charge | `financial.collect` **ou** `manage` |
| Ver lista `/billing` | `financial.view` |

## Regras

- Só `pending` → paid/canceled
- Cancelar appointment cancela charge pending (sem exigir collect)
- Campos `provider*` reservados para gateway futuro

## Schema

`charges` + `payments` em `src/db/schema/clinical-billing.ts`; service `charge.service.ts`.
