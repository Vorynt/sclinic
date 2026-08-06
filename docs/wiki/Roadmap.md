# Roadmap

Derivado do **código implementado** + ADRs 001–009 + gaps de produto priorizados (visão Agenda → Gestão → Plataforma operacional). Não há board externo; esta página é a fonte até existir uma.

Escopo deste backlog **exclui** (trilhas à parte ou já listadas em Next): envio WhatsApp, upload/storage de arquivos e gateway de pagamento clínico (este último permanece em Next por ADR-002).

## Legenda

| Status | Significado |
|--------|-------------|
| **Done** | Em produção no código atual |
| **Next** | Próximo a implementar (ADR pronto ou extensão natural) |
| **Backlog** | Priorizado de produto; pode exigir ADR antes do código |
| **Later** | Direção clara, sem decisão fechada |
| **Deferred** | Reservado no mapa de módulos, sem implementação |

Horizontes de entrega (orientação, não compromisso de data):

| Horizonte | Significado |
|-----------|-------------|
| **H1** | ~2–4 semanas — alto valor / baixo risco no núcleo atual |
| **H2** | ~1–2 meses — agenda/recepção e CRM operacional |
| **H3** | Trimestre+ — portal, retenção, especialidades, diferenciação |

---

## Agora (Done) — fundação operacional

1. Plataforma multi-clínica + auth + RBAC
2. Onboarding SaaS (planos Stripe) + gates de entitlement / over_limit
3. Cadastros: pacientes, profissionais, equipe
4. Owner com perfil clínico opcional (consultório solo — ADR-007)
5. Agenda + máquina de status + attendance
6. Prontuário MVP: notas, vitais, alertas, receitas (+ templates em blocos, ADR-008)
7. Loop balcão: charge + board recepção + SSE
8. Catálogo de serviços + desconto % + cortesia/retorno (ADR-009)
9. Auditoria + settings + landing
10. Central de ajuda `/help` (FAQ curado por papel)

---

## Backlog priorizado (produto)

Ordem = prioridade dentro do horizonte. Itens em **Next** (trilha técnica/ADR) podem correr **em paralelo** sem bloquear H1.

### H1 — Fechar o MVP clínico (documentos + CRM mínimo)

Fecha o gap mais citado após agenda: **documentos emitíveis** e **ficha do paciente útil sem abrir 5 abas**. Reusa o padrão receita (draft → issued → print HTML) — estender ADR-005 com `kind` (ou ADR novo).

| # | Item | Épico | Módulo | Notas |
|---|------|-------|--------|-------|
| 1 | Declaração de comparecimento | E13 | medical-records | **Done** (ADR-010) — draft→issued→print |
| 2 | Atestado médico | E13 | medical-records | Paciente, dias, CID opcional, observações; mesmo ciclo draft/issued |
| 3 | Solicitação de exames | E13 | medical-records | Template + corpo; sair do campo livre só na nota |
| 4 | Tipos de documento clínico (`kind`) | E13 | medical-records | **Done** (ADR-010) — enum + metadata |
| 5 | Overview do paciente consolidado | E14 | patients (+ composição) | Última/próxima consulta, alertas, financeiro resumido, notas admin numa tela |

**Critério de pronto H1:** no atendimento, emitir ≥3 tipos de documento; na ficha, ver contexto operacional sem caçar abas.

### H2 — Agenda avançada + recepção operacional + financeiro leve

| # | Item | Épico | Módulo | Notas |
|---|------|-------|--------|-------|
| 1 | Bloqueio de horários | E15 | appointments | **Done** (ADR-011) — `schedule_blocks`; indisponibilidade pontual sem “falso” appointment |
| 2 | Horário do profissional | E15 | professionals / appointments | **Done** (ADR-011) — `professional_business_hours`; interseção com horário da clínica |
| 3 | Lista de espera + encaixe | E15 | appointments | **Done** (ADR-011) — fila por profissional/serviço; promover a slot livre via `appointmentService.create` |
| 4 | Modalidade presencial / online | E15 | appointments | **Done** (ADR-011) — campo `modality`; filtro e badge na agenda |
| 5 | Confirmação em lote (dia) | E16 | appointments / dashboard | **Done** (ADR-011) — recepção marca `confirmed` em massa no board do dia |
| 6 | Filtro / visão inadimplentes | E6 | billing | **Done** (ADR-011) — `dueAt` por cobrança + aba Inadimplentes agrupada por paciente |
| 7 | Cadastro rápido de paciente (fluxo recepção) | E3 / E16 | patients | **Done** — `PatientFormDialog` variant `quick` (nome, CPF, telefone) na recepção |

**Critério de pronto H2:** recepção opera o dia (bloqueios, espera, confirmação) sem planilha paralela; gestor vê pendências financeiras por paciente. ✅ Atingido.

### H3 — Retenção, portal e plataforma operacional

Sem WhatsApp nesta trilha: campanhas e pré-consulta podem começar por **e-mail / link mágico / in-app**.

| # | Item | Épico | Módulo | Notas |
|---|------|-------|--------|-------|
| 1 | Pacientes inativos (última consulta) | E14 | patients / dashboard | Regra configurável (ex.: 6–8 meses) + CTA “entrar em contato” |
| 2 | Formulários pré-consulta | E17 | medical-records (+ link) | Anamnese/alergias antes da consulta; chega preenchido no attendance |
| 3 | Campanhas (aniversário, retorno, check-up) | E14 | marketing ou módulo novo | Automação leve; canal ≠ WhatsApp no primeiro corte |
| 4 | Portal do paciente | E17 | auth + módulo portal | Agendar/reagendar, ver documentos, atualizar cadastro |
| 5 | Assinatura eletrônica (consentimento / LGPD) | E13 | medical-records | Contratos/consentimentos; ADR próprio |
| 6 | Indicadores gerenciais | E18 | dashboard | Ocupação, no-show por profissional, tempo médio, retenção |
| 7 | Templates / módulos por especialidade | E5 / E19 | medical-records | Núcleo comum + packs (derm, psico, odonto…) |
| 8 | Horários recorrentes | E15 | appointments | Séries (ex.: semanal); cancelar ocorrência vs série |
| 9 | Agenda por sala / equipamento | E15 | appointments | Só se ICP exigir (estética, odonto, fisio) |
| 10 | Automações avançadas + IA clínica | E18 | medical-records / core | Pós-H3; supervisão do profissional; ADRs dedicados |

**Critério de pronto H3 (mínimo viável da fase):** inativos + pré-consulta **ou** portal; indicadores básicos na home do owner/manager.

---

## Próximo (Next) — trilha técnica / extensões de ADR

Corre **em paralelo** ao backlog de produto. Não compete com H1 por valor clínico, mas desbloqueia escala e monetização clínica.

| Item | Origem | Horizonte sugerido | Notas |
|------|--------|--------------------|-------|
| Gateway de pagamento clínico | ADR-002 | paralelo a H2–H3 | Campos `provider*` reservados; Asaas/PIX — **fora do escopo de produto deste backlog**, mas mantido no roadmap |
| Broker realtime multi-instância | ADR-006 | quando multi-instância | Hub in-process → Redis/NATS/etc. |
| Cotas de storage | ADR-004 | com upload de arquivos | `assertPlanCapacity(..., "storage")` — acoplado à trilha de arquivos (fora deste backlog) |

---

## Depois (Later) — já rastreados

| Item | Motivação |
|------|-----------|
| Tipos de receita além da simples (itens estruturados, ANVISA) | ADR-005; após `kind` genérico em H1 |
| Canvas posição livre no template | ADR-008 (MVP = blocos empilhados) |
| PDF persistido / assinatura digital de receita | Alternativa ao print HTML; alinha com H3 assinatura |
| Multi-clínica owned por assinatura | ADR-003 MVP é 1:1 |
| Instrumentação audit em 100% dos mutators | ADR-001 (manual por service) |
| Inventário / estoque | Módulo listado, schema deferred (E11) |
| Comissão de profissional / caixa diário dedicado | Extensão E6; após visão inadimplentes |
| Tarefas internas da recepção / histórico de contatos | Extensão E16; após confirmação em lote |
| Reagendamento em massa | Extensão E15/E16 |

---

## Não planejado neste ciclo

- Reescrever arquitetura de camadas
- Misturar SaaS e faturamento clínico no mesmo modelo
- Apagar dados em downgrade de plano
- Competir com ERP financeiro completo
- WhatsApp como canal MVP (diferencial futuro; fora deste backlog)
- Upload/galeria de arquivos e fotos antes/depois (trilha storage; fora deste backlog)

---

## Como atualizar

1. Ao **aceitar ADR** ou **shipar feature**: mover item entre H1/H2/H3 ↔ Done; refletir em [Épicos](Epicos) / [Catálogo](Catalogo-de-Features).
2. Itens Backlog que mudam schema ou boundary → ADR antes do código.
3. Skill: `system-docs-sync`.
