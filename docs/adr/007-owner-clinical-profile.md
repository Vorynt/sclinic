# ADR-007: Perfil clínico do owner (consultório solo)

- **Date**: 2026-07-28
- **Status**: Accepted
- **Deciders**: Time sclinic
- **Tags**: architecture, professionals, clinics, onboarding, rbac

## Context and Problem Statement

O owner (RBAC) e o profissional (perfil clínico agendável) são conceitos distintos. Criar a clínica não cria `professionals`, e o convite recusa e-mail já membro — o dono não consegue se auto-convidar. Consultórios solo (só o profissional gerencia a clínica) ficam sem quem receber agendamentos.

## Decision Drivers

- Cobrir ICP “dono = quem atende” sem dual membership RBAC
- Membership único por clínica (`owner`) permanece a fonte de verdade de permissões e assinatura (ADR-003)
- Agenda continua exigindo `professionalId` ativo
- Copy e UX sem misturar “papel de dono” com “perfil clínico”
- Fluxo Action → Service → Repository; quota `professionals` (ADR-004)

## Considered Options

- Dual membership `owner` + `doctor` na mesma clínica
- Auto-convite do próprio e-mail como doctor/nurse
- Sempre criar perfil profissional no `createForOwner`
- **Membership `owner` + perfil `professionals` opcional** (onboarding + CTA posterior)

## Decision Outcome

Chosen option: **membership permanece `owner`; perfil clínico opcional em `professionals` + `professional_clinics` vinculado ao `userId` do owner**.

| Tema | Decisão |
|------|---------|
| RBAC | Um membership: `owner`. Não existe dual-role. |
| Agenda | Owner só é assignee se houver professional ativo na clínica |
| Onboarding | Flag `alsoPractices` + dados clínicos condicionais |
| Posterior | CTA em `/professionals` se owner ainda sem perfil na clínica |
| Tipo clínico | Form pede Médico(a)/Enfermeiro(a) só para defaults de UI (pronome/conselho); **não** grava membership |
| Create | Service dedicado `createOwnerClinicalProfile` (não reutiliza invite) |
| Quota | Conta em `assertPlanCapacity(..., "professionals")` |
| Idempotência | Já afiliado ativo na clínica → conflito claro |

### Positive Consequences

- Solo e “dono que também atende” funcionam sem quebrar SaaS/RBAC
- Owner continua com permissões totais e visão completa da agenda
- Mesmo modelo de dados para profissionais convidados e owner-atendente

### Negative Consequences

- Owner não entra em self-schedule (`doctor`/`nurse`) — vê a agenda toda (aceitável para dono)
- Dois conceitos na UI (dono vs perfil clínico) exigem copy cuidadoso
- User com professional em outra clínica precisa afiliar o mesmo `professionals.userId` (unique global)

## Fora do escopo

Dual membership, forçar todo owner a ser profissional, multi-owner (E12), alterar self-schedule do owner.
