# ADR-009: Catálogo de serviços da clínica (precificação + desconto + cortesia)

- **Date**: 2026-08-02
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, billing, appointments, pricing
- **Fulfills**: item adiado em ADR-006 (“catálogo de preços fica para depois”)
- **Extends**: ADR-002 (charges 1:1), ADR-006 (fluxo balcão)

## Context and Problem Statement

O faturamento clínico (ADR-002) cria charge com `amountCents` digitado na agenda. Isso gera inconsistência de preços entre recepcionistas, não escala e impede precificação automática. Precisamos de um catálogo de **serviços da clínica** com valor fixo, ligado ao agendamento, com desconto percentual e cenários de cortesia/retorno — sem acoplar serviço a especialidade/profissional nesta fase.

## Decision Drivers

- Precificar consulta de forma previsível (fonte = catálogo da clínica)
- Manter charge 1:1 com appointment (ADR-002) e fluxo balcão (ADR-006)
- Histórico financeiro explícito para cortesia/retorno (não “sumir” com a cobrança)
- Snapshot: mudança futura no catálogo não reescreve charges antigas
- Todos os profissionais usam o mesmo catálogo (sem filter por especialidade no MVP)
- Fluxo Action → Service → Repository; RBAC `financial.*` existente
- Override de valor excepcional só para quem gerencia financeiro

## Considered Options

- Continuar valor avulso digitado (status quo)
- Catálogo global do produto (mesmos serviços para todas as clínicas)
- Serviço ↔ profissional/especialidade desde o MVP
- Cortesia sem gerar charge / charge waived com valor de lista
- **Catálogo por clínica + service obrigatório + desconto % + charge R$ 0 paid para cortesia/retorno**

## Decision Outcome

Chosen option: **"Catálogo por clínica + precificação automática + snapshot na charge"**.

### Domínio

| Conceito | Decisão |
|----------|---------|
| **Serviço** | Entidade tenant-scoped (`clinic_services`): nome, `priceCents`, `isActive`, soft-delete |
| **Obrigatório** | Todo **novo** appointment exige `serviceId` ativo da clínica |
| **Quem oferece** | Qualquer profissional; sem vínculo a especialidade no MVP |
| **Preço** | Derivado do serviço; desconto % (0–100) na criação e ajustável antes de liquidar |
| **Override** | Alterar valor líquido fora da fórmula só com `financial.manage` |
| **Cortesia / retorno** | Dois motivos distintos (`billingKind`), mesmo efeito: charge `amountCents = 0` já `paid` + payment `method: courtesy` |
| **Desconto 100% vs cortesia** | Não inferir cortesia pelo valor; flag de motivo é a fonte da verdade |
| **Módulo** | Catálogo e cálculo no subdomínio clínico de `billing`; `appointments` só envia `serviceId` + flags via contrato público |

### Schema alvo (implementação)

**`clinic_services`** (novo, RLS por `clinicId`):

- `name`, `description?`, `priceCents` (> 0 no cadastro), `currency` (BRL), `isActive`, timestamps, soft-delete, audit

**`appointments`**:

- `serviceId` FK → `clinic_services` — obrigatório em creates novos; legado pode ficar nullable até backfill opcional

**`charges`** (extensão; `amountCents` passa a permitir **0**):

- Snapshot: `serviceId?`, `serviceName`, `listAmountCents`, `discountPercent`
- `amountCents` = líquido final (após desconto ou 0 se cortesia/retorno)
- `billingKind`: `standard` \| `courtesy` \| `return`

**`payment_method`**: incluir `courtesy` para liquidação automática de cortesia/retorno.

### Regras de cálculo

```
se billingKind ∈ {courtesy, return}:
  amountCents = 0 → charge já paid + payment courtesy
senão:
  amountCents = round(listAmountCents * (100 - discountPercent) / 100)
  (override manage: amountCents informado, com list/discount ainda no snapshot)
```

Cortesia/retorno **não** entra na coluna “Aguardando pagamento” do board (já `paid`).

### UX / permissões

| Superfície | Comportamento |
|------------|---------------|
| CRUD serviços | `financial.manage` (settings ou `/billing`) |
| Agenda — criar | Select serviço (obrigatório) → preço; campo desconto %; flag cortesia **ou** retorno |
| Agenda — valor livre | Só `financial.manage` (override) |
| Confirmação pagamento | Pode ajustar % (e override se manage) **antes** de `markPaid`; cortesia/retorno já liquidada |
| Listagem `/billing` | Exibe serviço, lista, desconto, líquido, kind |

### Fora do MVP

- Serviço por profissional/especialidade
- Pacotes / sessões / convênios
- Comissão do profissional
- Cobrança sem appointment

### Positive Consequences

- Preço consistente na operação do dia a dia
- ADR-006 “catálogo depois” fica resolvido sem romper charge 1:1
- Cortesia e retorno auditáveis no financeiro
- Extensível depois a vínculo profissional sem migrar o conceito de serviço

### Negative Consequences

- Appointments legados sem `serviceId` até backfill/migration policy
- Relaxar `amountCents > 0` aumenta cuidado em validators/UI (zero só com kind correspondente ou desconto 100%)
- Dois caminhos de “grátis” (desconto 100% vs cortesia) exigem disciplina de UX e relatório

## Pros and Cons of the Options

### Catálogo por clínica + snapshot ✅ Chosen

- ✅ Alinha com multi-tenant e autonomia da clínica
- ✅ Histórico estável; override controlado
- ❌ Exige CRUD + migration + mudança no form/board

### Status quo (valor digitado)

- ✅ Já funciona
- ❌ Sem padronização; ADR-006 já sinalizou como gap

### Catálogo global do produto

- ✅ Onboarding rápido
- ❌ Clínicas têm tabelas distintas; pouco realista no Brasil

### Serviço ↔ profissional no MVP

- ✅ Precisão clínica
- ❌ Prematuro; usuário pediu catálogo único por clínica agora

### Cortesia sem charge

- ✅ Simples
- ❌ Some do histórico financeiro (rejeitado)

## Links

- [ADR-002 — faturamento clínico](./002-clinical-billing.md)
- [ADR-006 — recepção + SSE](./006-reception-ops-sse.md) (deferral do catálogo)
- Wiki: [Faturamento clínico](../wiki/Dominio-Faturamento-Clinico.md), [Agendamentos](../wiki/Dominio-Agendamentos.md)
