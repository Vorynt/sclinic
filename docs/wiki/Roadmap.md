# Roadmap

Derivado do **código implementado** + ADRs 001–006 + gaps explícitos no repositório. Não há board externo de produto; esta página é a fonte até existir uma.

## Legenda

| Status | Significado |
|--------|-------------|
| **Done** | Em produção no código atual |
| **Next** | Extensão natural dos ADRs / stubs |
| **Later** | Direção clara, sem decisão fechada |
| **Deferred** | Reservado no mapa de módulos, sem implementação |

## Agora (Done) — fundação operacional

1. Plataforma multi-clínica + auth + RBAC
2. Onboarding SaaS (planos Stripe) + gates de entitlement / over_limit
3. Cadastros: pacientes, profissionais, equipe
4. Owner com perfil clínico opcional (consultório solo — ADR-007)
5. Agenda + máquina de status + attendance
6. Prontuário MVP: notas, vitais, alertas, receitas
7. Loop balcão: charge + board recepção + SSE
8. Auditoria + settings + landing

## Próximo (Next) — extensões dos ADRs

| Item | Origem | Notas |
|------|--------|-------|
| Gateway de pagamento clínico | ADR-002 | Campos `provider*` já reservados; Asaas/PIX |
| Broker realtime multi-instância | ADR-006 | Hub in-process → Redis/NATS/etc. |
| Cotas de storage | ADR-004 | `assertPlanCapacity(..., "storage")` futuro |
| Help center `/help` | `routes.help` disabled | Conteúdo + enable nav |
| Filtro “minha agenda” na home do médico | UI DoctorHome | Texto admite gap |

## Depois (Later)

| Item | Motivação |
|------|-----------|
| Tipos de receita além da simples | ADR-005 (sem `kind` no MVP) |
| PDF / assinatura digital de receita | Alternativa ao print HTML |
| Multi-clínica owned por assinatura | ADR-003 MVP é 1:1 |
| Instrumentação audit em 100% dos mutators | ADR-001 (manual por service) |
| Inventário / estoque | Módulo listado, schema deferred |

## Não planejado neste ciclo

- Reescrever arquitetura de camadas
- Misturar SaaS e faturamento clínico no mesmo modelo
- Apagar dados em downgrade de plano

## Como atualizar

Ao concluir uma feature ou aceitar um ADR: mover o item entre faixas e refletir em [Épicos](Epicos) / [Catálogo](Catalogo-de-Features). Skill: `system-docs-sync`.
