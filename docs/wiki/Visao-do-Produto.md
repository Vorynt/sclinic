# Visão do produto

## O que é

**sclinic** é um SaaS multi-clínica para gestão de consultórios e clínicas pequenas/médias: pacientes, profissionais, agenda, atendimento clínico, cobrança no balcão e assinatura do produto via Stripe.

## Problema

Clínicas operam em ferramentas fragmentadas (agenda, prontuário, caixa, planilha). O sclinic unifica o fluxo operacional do dia — da marcação ao pagamento — com papéis claros (recepção, clínico, financeiro, owner) e monetização do software separada da cobrança ao paciente.

## Dois mundos financeiros (conceito central)

| Mundo | Significado | Pagador |
|-------|-------------|---------|
| **SaaS** | Plano do produto (Essencial / Profissional / Enterprise) | Owner (usuário) via Stripe |
| **Clínico** | Contas a receber da consulta | Paciente (registro manual no MVP) |

Misturar os dois é erro de modelagem — ver ADR-002 e ADR-003.

## Personas / papéis

| Papel | Foco |
|-------|------|
| Owner | Plano, clínica, equipe, settings, auditoria |
| Admin / Manager | Operação e gestão |
| Recepcionista | Agenda, board do dia, cobrança no balcão |
| Médico / Enfermeiro | Atendimento, prontuário, receitas |
| Financeiro | Listagem de cobranças clínicas |

Detalhe: [RBAC](RBAC-e-Permissoes).

## Escopo atual (MVP avançado)

Implementado de ponta a ponta:

- Auth (Better Auth), convites, onboarding de plano/clínica
- Multi-clínica com switcher e gates de assinatura
- Pacientes, profissionais, agenda, attendance
- Notas clínicas, sinais vitais, alertas, receitas imprimíveis
- Board da recepção + SSE
- Cobranças clínicas manuais + assinatura Stripe + over_limit
- Auditoria por clínica
- Landing marketing

## Fora do escopo atual (explícito)

| Item | Status |
|------|--------|
| Inventário / estoque | Domínio reservado, **sem features** |
| Gateway de pagamento clínico (PIX/Asaas etc.) | Planejado (ADR-002) |
| PDF persistido de receita | Fora (HTML + print) |
| Multi-assinatura por user (N clínicas owned) | MVP 1:1 (ADR-003) |

## Norte de produto

Fechar o **loop operacional do dia** com realtime e papéis corretos; depois aprofundar prontuário, pagamentos clínicos automatizados e escala multi-estação — ver [Roadmap](Roadmap).
