# Requisitos do sistema

Documento canônico de **requisitos funcionais (RF)**, **não funcionais (RNF)**, **personas**, **jornadas** e **restrições** do sclinic.

> Derivado de `docs/wiki/` (domínios, catálogo, épicos, RBAC), `docs/adr/` (001–008) e `architecture/` (001–012).  
> Status: **Done** | **Partial** | **Planned** | **Deferred**.  
> Atualizar junto com o [Catálogo de features](Catalogo-de-Features) quando o comportamento observável mudar.

## Sumário

1. [Visão e escopo](#1-visao-e-escopo)
2. [Personas](#2-personas)
3. [Jornadas principais](#3-jornadas-principais)
4. [Requisitos funcionais](#4-requisitos-funcionais)
5. [Máquinas de estado](#5-maquinas-de-estado)
6. [Requisitos não funcionais](#6-requisitos-nao-funcionais)
7. [Restrições e fora de escopo](#7-restricoes-e-fora-de-escopo)
8. [Matriz RF × persona](#8-matriz-rf--persona)
9. [Rastreabilidade](#9-rastreabilidade)

---

## 1. Visão e escopo

### 1.1 Produto

**sclinic** é um SaaS multi-clínica para gestão de consultórios e clínicas pequenas/médias: pacientes, profissionais, agenda, atendimento clínico, cobrança no balcão e assinatura do produto via Stripe.

### 1.2 Problema

Clínicas operam em ferramentas fragmentadas (agenda, prontuário, caixa, planilha). O sclinic unifica o fluxo operacional do dia — da marcação ao pagamento — com papéis claros e monetização do software **separada** da cobrança ao paciente.

### 1.3 Dois mundos financeiros (conceito central)

| Mundo | Significado | Pagador | Modelo |
|-------|-------------|---------|--------|
| **SaaS** | Plano do produto (Essencial / Profissional / Enterprise) | Owner (usuário) via Stripe | ADR-003 |
| **Clínico** | Contas a receber da consulta | Paciente (manual no MVP) | ADR-002 |

Misturar os dois é erro de modelagem.

### 1.4 Escopo atual (MVP avançado)

Auth, multi-clínica, planos Stripe, pacientes, profissionais, agenda, attendance, prontuário (notas, vitais, alertas, receitas + templates), board da recepção + SSE, cobranças clínicas manuais, auditoria, settings, ajuda, landing.

### 1.5 Fora do escopo atual

| Item | Status |
|------|--------|
| Inventário / estoque | Deferred |
| Gateway de pagamento clínico (PIX/Asaas etc.) | Planned (ADR-002) |
| PDF persistido de receita | Later |
| Multi-assinatura / N clínicas owned por assinatura | Later (MVP 1:1) |
| Broker realtime multi-instância | Next (ADR-006) |
| Cotas de storage | Planned (ADR-004) |

Detalhe: [Visão do produto](Visao-do-Produto) · [Roadmap](Roadmap).

### 1.6 Backlog priorizado (produto)

Horizontes H1–H3 em [Roadmap](Roadmap) — documentos clínicos (E13), CRM/retenção (E14), agenda avançada (E15), recepção lote (E16), portal/pré-consulta (E17). Escopo de produto H1–H3 **exclui** WhatsApp, upload de arquivos e gateway de pagamento (este último permanece Next técnico · E10).

---

## 2. Personas

Personas de produto alinhadas aos papéis RBAC (`roleKey`). Cada persona descreve contexto, objetivos, dores e capabilities esperadas — não substitui a [matriz de permissões](RBAC-e-Permissoes).

### 2.1 Primárias

#### P1 — Marina (Owner)

| Campo | Conteúdo |
|-------|----------|
| **Papel** | `owner` |
| **Contexto** | Dona ou sócia da clínica; paga o plano Stripe; pode ou não atender pacientes (perfil clínico opcional — ADR-007). |
| **Objetivos** | Manter a clínica no ar (assinatura, cotas), montar equipe, configurar horários/timbrado, acompanhar uso e auditoria. |
| **Dores** | Misturar “pagamento do software” com “caixa do dia”; perder controle de quem tem acesso; downgrade que apague dados. |
| **Capabilities** | Onboarding plan→clinic→hours; switcher; settings (geral, hours, prescriptions, usage, danger, audit); convites; opcionalmente perfil clínico sem mudar role. |
| **Home** | KPIs de plano, cotas, pacientes, agenda do mês, a receber/recebido. |

#### P2 — Carla (Recepcionista)

| Campo | Conteúdo |
|-------|----------|
| **Papel** | `receptionist` |
| **Contexto** | Frente de balcão; agenda o dia e cobra o paciente. |
| **Objetivos** | Marcar/remarcar, ver o board do dia, receber pagamento sem depender do médico. |
| **Dores** | Médico “preso” no caixa; board desatualizado entre estações; não poder iniciar atendimento (proposital). |
| **Capabilities** | Pacientes (read/write), agenda (create/update/delete), `financial.collect` (sem `financial.view` → não precisa de `/billing`). |
| **Home** | Contagens + **ReceptionOpsBoard** (SSE). |

#### P3 — Dr. Rafael (Médico)

| Campo | Conteúdo |
|-------|----------|
| **Papel** | `doctor` |
| **Contexto** | Atende pacientes; agenda tipicamente **self-schedule** (só a si). |
| **Objetivos** | Iniciar/concluir atendimento, registrar nota/vitais/alertas, emitir receitas imprimíveis — **sem** UI de cobrança no fluxo clínico. |
| **Dores** | Ter que cobrar no final da consulta; prontuário espalhado; receita sem timbrado da clínica. |
| **Capabilities** | `records.*`, `appointments.create/update`, `financial.collect` (escape hatch), sem `appointments.delete` / `professionals.manage`. |
| **Home** | Contagens da própria agenda. |

#### P4 — Ana (Enfermeira)

| Campo | Conteúdo |
|-------|----------|
| **Papel** | `nurse` |
| **Contexto** | Apoio clínico; fila com ênfase em check-in; self-schedule. |
| **Objetivos** | Registrar vitais/notas, avançar o paciente no atendimento. |
| **Dores** | Falta de visão da fila; restrição de escrita em pacientes (`patients.write` não). |
| **Capabilities** | `patients.read`, `records.*`, agenda create/update, inicia atendimento; sem `financial.collect`. |
| **Home** | Fila clínica + preview da própria agenda. |

#### P5 — Bruno (Financeiro)

| Campo | Conteúdo |
|-------|----------|
| **Papel** | `financial` |
| **Contexto** | Acompanha contas a receber clínicas (não o Stripe SaaS). |
| **Objetivos** | Ver e liquidar cobranças; fechar o mês. |
| **Dores** | Confundir assinatura do produto com recebíveis; lista incompleta. |
| **Capabilities** | `financial.view` + `manage` + `collect`; `patients.read`; sem agenda write / records. |
| **Home** | A receber/recebido no mês + top pendentes. |

### 2.2 Secundárias

#### P6 — Juliana (Admin)

| Campo | Conteúdo |
|-------|----------|
| **Papel** | `admin` |
| **Contexto** | Operação plena quase como owner, sem ser o pagador SaaS. |
| **Objetivos** | Equipe, profissionais, settings, auditoria, fluxo do dia. |
| **Capabilities** | Quase todas as perms (inclui `settings.manage`, `audit.read`, `financial.*`); **não** `/settings/usage` (só owner). |

#### P7 — Pedro (Manager)

| Campo | Conteúdo |
|-------|----------|
| **Papel** | `manager` |
| **Contexto** | Gestão operacional do dia (ocupação, equipe limitada). |
| **Objetivos** | Ver ocupação, convidar membros, cobrar no balcão. |
| **Capabilities** | Sem `financial.manage`, sem `settings.manage`, sem `audit.read`, sem `records.write`. |
| **Home** | Ocupação do dia (aguardando / em atendimento / concluídos). |

### 2.3 Personas de borda (não RBAC)

| ID | Nome | Descrição |
|----|------|-----------|
| **P8** | Visitante | Consome a landing `/` (marketing); CTAs → login/sign-up. |
| **P9** | Convidado | Recebeu invite de equipe ou profissional; aceita com senha; e-mail verificado pelo token. |
| **P10** | Owner clínico (solo) | Variante de P1 com `alsoPractices`: agenda completa (não self-schedule), atende e ainda gerencia a clínica. |

### 2.4 Anti-personas / não-objetivos

- Paciente final **não** é usuário do produto no MVP (sem portal do paciente).
- Operador de estoque (inventário Deferred).
- Contador externo com acesso a NF-e / gateway fiscal (não modelado).

---

## 3. Jornadas principais

### J1 — Onboarding do owner

1. Sign-up → verify-email (ou invite path).  
2. `/onboarding/plan` → Checkout Stripe.  
3. `/onboarding/clinic` (+ opcional `alsoPractices` → perfil clínico).  
4. `/onboarding/hours` → `/home`.  

Diagrama: [Diagramas §2](Diagramas).

### J2 — Dia operacional (balcão → clínico → caixa)

1. Recepção cria appointment com serviço (+ desconto/cortesia opcional) → charge `pending` (ou R$ 0 `paid` se cortesia/retorno).  
2. Médico/enfermeiro inicia (`checked_in`) e conclui (`completed`) **sem** UI de pagamento.  
3. Board: coluna “Aguardando pagamento” → `markPaid` (pode ajustar desconto % antes).  
4. SSE `clinic.ops` atualiza o board.  

Diagrama: [Diagramas §3](Diagramas) · ADR-006 · ADR-009.

### J3 — Atendimento clínico

1. Start attendance → workspace `(attendance)`.  
2. Nota (1:1), vitais (IMC derivado), alertas do paciente.  
3. Receita `draft` → `issued` (freeze layout + snapshots) → print HTML.  

### J4 — Convite de equipe / profissional

1. Owner/admin/manager convida (quota `assertPlanCapacity`).  
2. Convidado aceita (TTL 7 dias; senha ≥ 8).  
3. Membership `active` ou perfil profissional ativo.  

### J5 — Downgrade / over_limit

1. Owner reduz plano via Portal Stripe.  
2. Dados **permanecem**; banner `over_limit` para todos.  
3. Bloqueia apenas creates que aumentam uso (users / professionals / storage futuro).  

ADR-004.

### J6 — Pós-auth (gates)

Ordem canônica: `mustChangePassword` → invite → `emailVerified` → membership (suspended / select-clinic / onboarding / home).

---

## 4. Requisitos funcionais

Convenção de ID: `RF-<DOMÍNIO>-NNN`.

### 4.1 Autenticação — `RF-AUTH`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-AUTH-001 | Login | Autenticar via Better Auth | Todas | Done |
| RF-AUTH-002 | Sign-up | Cadastro de conta | P8→P1 | Done |
| RF-AUTH-003 | Forgot / reset | Recuperação de senha | Públicas | Done |
| RF-AUTH-004 | Verify email | Gate de e-mail verificado | Todas | Done |
| RF-AUTH-005 | Change password provisória | Troca obrigatória (`mustChangePassword`) | P9 | Done |
| RF-AUTH-006 | Redirect pós-auth | Orquestração canônica de destino | Todas | Done |
| RF-AUTH-007 | Aceite de invite | Invite pode preceder verify-email; token prova ownership | P9 | Done |
| RF-AUTH-008 | Guard entitlement | Clínica sem assinatura viva bloqueada (`requireClinic`) | Membros | Done |
| RF-AUTH-009 | Resolução de permissões | Runtime por membership + seed RBAC | Todas | Done |

### 4.2 Clínicas — `RF-CLI`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-CLI-001 | Criar clínica | `createForOwner`: clinic + membership owner | P1 | Done |
| RF-CLI-002 | Horários onboarding | Configurar `clinic_hours` | P1 | Done |
| RF-CLI-003 | Owner também atende | Flag `alsoPractices` → perfil clínico (ADR-007) | P10 | Done |
| RF-CLI-004 | Settings geral | name, tradeName, document, contato, logo, timezone, endereço | P1, P6 | Done |
| RF-CLI-005 | Settings hours | Horários semanais | P1, P6 | Done |
| RF-CLI-006 | Danger zone | Exclusão de clínica | P1, P6 | Done |
| RF-CLI-007 | Clinic switcher | Troca de clínica; suspended disabled | Multi-clínica | Done |
| RF-CLI-008 | Select-clinic | Seleção com estados membership suspended / assinatura bloqueada; owner regulariza ou exclui | Membros | Done |
| RF-CLI-009 | Espelho de assinatura | `subscriptionStatus` denormalizado na clínica | Sistema | Done |

### 4.3 Usuários e equipe — `RF-USR`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-USR-001 | TeamPanel | Listar membros e convites (`/users`) | P1, P6, P7 | Done |
| RF-USR-002 | Convidar membro | Roles assignable; TTL 7d; quota users | P1, P6, P7 | Done |
| RF-USR-003 | Aceite invite equipe | Nome, e-mail, role; senha ≥ 8 | P9 | Done |
| RF-USR-004 | Suspender membro | Permanece na lista; **não** ocupa cota | Gestores | Done |
| RF-USR-005 | Reativar membro | — | Gestores | Done |
| RF-USR-006 | Soft-remove | `removed` + `deletedAt`; some da listagem | Gestores | Done |
| RF-USR-007 | Conta pessoal | `/account` overview, profile, security | Todas | Done |
| RF-USR-008 | Conta subscription | `/account/subscription` (Portal) | P1 | Done |

**Regras:** não alterar owner nem a si; roles de invite ≠ `owner`/`doctor`/`nurse`.

### 4.4 Pacientes — `RF-PAC`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-PAC-001 | Lista + busca | Paginada, escopo `clinicId` | Com `patients.read` | Done |
| RF-PAC-002 | CRUD | CPF único por clínica; name ≤ 200 | `patients.write` | Done |
| RF-PAC-003 | Detalhe cadastro | Abas resumo/profile | Leitores | Done |
| RF-PAC-004 | Detalhe appointments | Histórico | Leitores | Done |
| RF-PAC-005 | Abas clínicas | notes/vitals/prescriptions (`records.read`) | Clínicos | Done |
| RF-PAC-006 | Soft delete | Status `archived` | `patients.write` | Done |

### 4.5 Profissionais — `RF-PRO`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-PRO-001 | Lista | Perfis clínicos | `professionals.manage` | Done |
| RF-PRO-002 | Convite doctor/nurse | TTL 7d; quota professionals | Gestores | Done |
| RF-PRO-003 | Aceite profissional | Conselho, pronome; e-mail deve coincidir | P9 | Done |
| RF-PRO-004 | Editar perfil | — | Gestores | Done |
| RF-PRO-005 | Active / inactive | Inactive **não agenda** | Gestores | Done |
| RF-PRO-006 | Soft delete | + revoga convites pendentes | Gestores | Done |
| RF-PRO-007 | Perfil clínico do owner | Sem invite; conta na cota | P10 | Done |
| RF-PRO-008 | Integração agenda | Ativos; self-schedule doctor/nurse; owner clínico vê agenda completa | P3, P4, P10 | Done |

### 4.6 Agendamentos — `RF-AGE`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-AGE-001 | Calendário | Dia/semana/mês | Agenda | Done |
| RF-AGE-002 | Criar/editar | startsAt futuro; duração ≤ 8h; horário da clínica; sem overlap ≠ canceled; sugerir próximos slots livres | Quem agenda | Done |
| RF-AGE-003 | Tipos | consultation, follow_up, procedure, evaluation, other | — | Done |
| RF-AGE-004 | Transições de status | Ver §5 | Clínico / recepção | Done |
| RF-AGE-005 | Cancelamento | Cascata: cancela charge `pending` | Quem cancela | Done |
| RF-AGE-006 | Workspace attendance | Notas/vitais/receitas; leitura em `completed` | P3, P4, P10 | Done |
| RF-AGE-007 | Iniciar atendimento | Só owner, admin, doctor, nurse | Clínicos | Done |
| RF-AGE-008 | Valor → charge | `amountCents` + collect (legado) | Caixa | Done |
| RF-AGE-009 | Self-schedule | Doctor/nurse só a si | P3, P4 | Done |
| RF-AGE-010 | Serviço no agendamento | `serviceId` obrigatório; desconto %; cortesia/retorno | Caixa | Done |

**Editável:** `scheduled\|confirmed\|checked_in`. **Terminais:** `completed\|canceled\|no_show`.

### 4.7 Prontuário e receitas — `RF-PRT`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-PRT-001 | Clinical notes | 1 nota / appointment; editável em `checked_in` | Clínicos | Done |
| RF-PRT-002 | Templates de nota | blank, first_visit, follow_up, soap, procedure | Clínicos | Done |
| RF-PRT-003 | Vital signs | 1 / appointment; IMC derivado | Clínicos | Done |
| RF-PRT-004 | Clinical alerts | Escopo paciente; kinds + severity | Clínicos | Done |
| RF-PRT-005 | Prescriptions | 0..N / appointment; entidade própria | Clínicos | Done |
| RF-PRT-006 | Emitir receita | `draft` → `issued` imutável + freeze | Clínicos | Done |
| RF-PRT-007 | Print HTML | `@media print`; sem PDF | Clínicos | Done |
| RF-PRT-008 | Templates timbrado | Até 3 / clínica; um default | P1, P6 | Done |
| RF-PRT-009 | Designer de blocos | DocumentModel → HTML (ADR-008) | P1, P6 | Done |
| RF-PRT-010 | Tipos avançados / PDF | Extensões | — | Planned/Later |

### 4.8 Recepção e realtime — `RF-REC`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-REC-001 | ReceptionOpsBoard | 3 colunas derivadas (sem novo status) | P2 | Done |
| RF-REC-002 | Coluna Próximos | scheduled \| confirmed (hoje) | P2 | Done |
| RF-REC-003 | Coluna Em atendimento | checked_in | P2 | Done |
| RF-REC-004 | Coluna Aguardando pagamento | completed + charge pending | P2 | Done |
| RF-REC-005 | Receber no board | markPaid | Collect | Done |
| RF-REC-006 | SSE clinic.ops | `GET /api/realtime/clinic` | Ops | Partial |
| RF-REC-007 | Broker multi-instância | Fan-out atrás do mesmo contrato | — | Planned |

### 4.9 Faturamento clínico — `RF-FAT`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-FAT-001 | Criar charge | 1 ativa / appointment | Collect/manage | Done |
| RF-FAT-002 | markPaid | Só `pending` → paid | Collect/manage | Done |
| RF-FAT-003 | Cancel charge | Só `pending` → canceled | Collect/manage | Done |
| RF-FAT-004 | Listagem `/billing` | Exige `financial.view` | P5, P1, P6 | Done |
| RF-FAT-005 | Métodos manuais | cash, pix_manual, card, transfer, other | Caixa | Done |
| RF-FAT-006 | Cascata cancel appointment | Cancela pending automaticamente | Sistema | Done |
| RF-FAT-007 | Gateway externo | Campos `provider*` | — | Planned |
| RF-FAT-008 | Catálogo de serviços | CRUD por clínica; preço fixo; `financial.manage` | P5, P1, P6 | Done |
| RF-FAT-009 | Snapshot na charge | serviço, lista, % desconto, líquido, `billingKind` | Sistema | Done |
| RF-FAT-010 | Cortesia / retorno | Charge R$ 0 já paid + method `courtesy` | Caixa | Done |
| RF-FAT-011 | Override de valor | Fora da fórmula só com `financial.manage` | P5, P1 | Done |

### 4.10 Assinatura SaaS — `RF-SAAS`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-SAAS-001 | Assinatura por owner | Sub por `userId`, não por clinic | P1 | Done |
| RF-SAAS-002 | Unique viva | `trialing` \| `active` \| `past_due` | Sistema | Done |
| RF-SAAS-003 | Entitlement de convidados | Usa assinatura do owner | Membros | Done |
| RF-SAAS-004 | Checkout Stripe | + webhook sync; trial 7d na 1ª assinatura (cartão agora, cobra depois) | P1 | Done |
| RF-SAAS-005 | Customer Portal | Portal-first; self-service mesmo sem entitlement | P1 | Done |
| RF-SAAS-006 | Planos + cotas | Essencial / Profissional / Enterprise (seed) | — | Done |
| RF-SAAS-007 | Metering + over_limit | Banner; bloqueia creates; não derruba sessão | Todos / P1 | Done |
| RF-SAAS-008 | UI usage | `/settings/usage` | P1 | Done |
| RF-SAAS-009 | Downgrade livre | Sem apagar dados | P1 | Done |
| RF-SAAS-010 | N clínicas owned | 1:N por assinatura | — | Later |
| RF-SAAS-011 | Cota storage | `assertPlanCapacity(..., "storage")` | — | Planned |
| RF-SAAS-012 | Regularização Portal-first | unpaid/canceled → Portal; Checkout só sem customer | P1 | Done |
| RF-SAAS-013 | Delete + cancel Stripe | Teardown sem entitlement; cancel imediato (1:1) | P1 | Done |

### 4.11 Auditoria — `RF-AUD`

| ID | Título | Descrição | Personas | Status |
|----|--------|-----------|----------|--------|
| RF-AUD-001 | Append-only | Log imutável por clínica | Sistema | Done |
| RF-AUD-002 | Escrita via events | `core/events` → `recordAudit` | Services | Done |
| RF-AUD-003 | UI `/settings/audit` | `audit.read` | P1, P6 | Done |
| RF-AUD-004 | Cobertura de mutators | Instrumentação manual | Sistema | Partial |

### 4.12 Dashboard, settings e ajuda — `RF-DASH` / `RF-SET` / `RF-HELP`

| ID | Título | Descrição | Status |
|----|--------|-----------|--------|
| RF-DASH-001 | AppShell + nav por permissão | Itens somem sem perm | Done |
| RF-DASH-002 | Homes por `roleKey` | Landing única `/home` | Done |
| RF-DASH-003 | Atalho Ajuda nas homes | Todas as personas | Done |
| RF-DASH-004 | AttendanceShell | Shell sem sidebar completa | Done |
| RF-SET-001 | Settings shell | Composição (não god module) | Done |
| RF-SET-002 | Gates settings | general/hours/prescriptions → `settings.manage` | Done |
| RF-HELP-001 | FAQ por papel | Conteúdo em `constants/faq/<papel>.ts` | Done |
| RF-HELP-002 | Categorias + busca | Sem acento; esconde vazios | Done |
| RF-HELP-003 | Deep link | `?q=&category=&article=` | Done |
| RF-HELP-004 | Sem LLM | Conteúdo curado | Done |

### 4.13 Marketing — `RF-MKT`

| ID | Título | Descrição | Status |
|----|--------|-----------|--------|
| RF-MKT-001 | Landing `/` | Hero, features, showcase mock, CTAs | Done |
| RF-MKT-002 | Showcase ilustrativo | Não validar como dados reais | Done |

### 4.14 Inventário — `RF-INV`

| ID | Título | Status |
|----|--------|--------|
| RF-INV-001 | Estoque / inventário | Deferred |

### 4.15 Transversais de sistema — `RF-SYS`

| ID | Título | Descrição | Status |
|----|--------|-----------|--------|
| RF-SYS-001 | Fluxo de camadas | Page → Action → Service → Repository → Drizzle | Done |
| RF-SYS-002 | Multi-tenancy | Dados clínicos/ops por `clinicId` | Done |
| RF-SYS-003 | Gates de layout | E-mail, senha, membership, entitlement | Done |
| RF-SYS-004 | APIs | auth, Stripe webhook, realtime clinic | Done |
| RF-SYS-005 | Proxy Next 16 | `src/proxy.ts` | Done |
| RF-SYS-006 | Boundaries | Sem cross-import de internals | Done |
| RF-SYS-007 | Validação Zod única | Client (RHF) + action (`parseOrThrow`) | Done |
| RF-SYS-008 | Docs observáveis | Atualizar `docs/wiki/` na entrega | Done |

---

## 5. Máquinas de estado

### Appointment

```
scheduled → confirmed (opcional)
scheduled|confirmed → checked_in | no_show
checked_in → completed
qualquer ≠ canceled → canceled
```

### Charge (clínico)

`pending` → `paid` | `canceled`

### Prescription

`draft` → `issued` (imutável)

### Patient

`active` | `inactive` | `archived`

### Membership

`active` | `suspended` | `removed`

### Subscription SaaS (viva)

`trialing` | `active` | `past_due`

### Professional (UI)

`invite_pending` | `invite_expired` | `invite_revoked` | `active` | `inactive`

Diagramas Mermaid: [Diagramas](Diagramas).

---

## 6. Requisitos não funcionais

### 6.1 Segurança

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-010 | Better Auth | Autenticação da plataforma | Arquitetura |
| RNF-011 | Proxy de rotas | `src/proxy.ts` (Next 16) | Ambientes |
| RNF-012 | Sem vazamento interno | Não expor cause/stack/DB ao client | architecture/008 |
| RNF-013 | Validação server-side | Mesmo Zod do form na action | architecture/004, 011 |
| RNF-014 | Sanitização HTML | Allowlist no layout de receita | ADR-005 |
| RNF-015 | Superfície PCI reduzida | Stripe Customer Portal | ADR-003 |
| RNF-016 | Webhooks idempotentes | Stripe sync local | ADR-003 |
| RNF-017 | Audit privilegiado | `audit.read` (não reusar settings) | ADR-001 |
| RNF-018 | RBAC financeiro granular | view / manage / collect | ADR-002 |
| RNF-019 | Sem `console.log` prod | — | architecture/003 |
| RNF-020 | Sem `any` injustificado | — | architecture/003 |

### 6.2 Multi-tenancy e isolamento

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-030 | Escopo `clinicId` | Todo dado clínico/ops | Arquitetura |
| RNF-031 | RLS por clínica | Audit, billing clínico, receitas | ADRs 001, 002, 005 |
| RNF-032 | Entitlement do owner | Membros usam assinatura do owner | ADR-003 |
| RNF-033 | Suspended ≠ sem assinatura | Distinção explícita | Arquitetura |

### 6.3 Performance e dados

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-001 | Listagens server-side | `page`/`q` na URL; pageSize default 20, máx. 100 | architecture/012 |
| RNF-002 | Preferir Server Actions | ApiClient+RQ só quando necessário | architecture/007 |
| RNF-003 | Print HTML vs PDF | Sem storage externo no MVP | ADR-005, 008 |

### 6.4 Disponibilidade e operação

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-040 | DBs isolados por ambiente | Dev ≠ prod | Ambientes |
| RNF-041 | Migrations versionadas | Sem `db:push` em prod; seeds fora do deploy | Ambientes |
| RNF-042 | Migrate só Production | Preview Vercel não migrate | Ambientes |
| RNF-043 | SSE maxDuration | Runtime Node adequado | ADR-006 |
| RNF-044 | Seed RBAC obrigatório | Setup local | Ambientes |

### 6.5 Escalabilidade e realtime

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-050 | Contrato SSE estável | Browser não muda ao trocar fan-out | ADR-006 |
| RNF-051 | Hub in-process (MVP) | Broker (Redis etc.) depois | ADR-006 |
| RNF-052 | Assinatura 1:1 MVP | 1:N clínicas = Later | ADR-003 |
| RNF-053 | Charge extensível a gateway | Campos `provider*` | ADR-002 |

### 6.6 Manutenibilidade

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-060 | Feature-based modules | `src/modules/<feature>/` | architecture/001 |
| RNF-061 | Camadas obrigatórias | Sem Page→DB | architecture/004–006 |
| RNF-062 | Boundaries | Sem cross-import | architecture/003 |
| RNF-063 | SaaS ≠ clínico | Naming `billing.*` vs `charge.*` | ADR-002, 003 |
| RNF-064 | `shared/` restrito | Só api/auth/errors/validators | architecture/002 |
| RNF-065 | Alias `@/` | — | architecture/002 |
| RNF-067 | Designer isolado | `prescription-template-designer/` | ADR-008 |

### 6.7 Observabilidade e erros

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-070 | Códigos de erro estáveis | `AppError` + `getClientMessage` | architecture/008 |
| RNF-071 | Log estruturado | `core/logger`; não engolir erros | architecture/008 |
| RNF-072 | Auditoria append-only | Via `core/events` | ADR-001 |
| RNF-073 | TechnicalError no repo | Service mapeia para AppError | architecture/006, 008 |
| RNF-120 | Result na borda | `ApiResponse` / `toActionResult` | architecture/008 |
| RNF-121 | ApiClient → AppError | Sem `fetch` solto | architecture/007 |
| RNF-122 | MutationCallbacks | invalidate no hook; form sem try/catch | architecture/007 |

### 6.8 Proteção de dados / continuidade

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-080 | Trilha auditável | Consultável; documentos clínicos rastreáveis | ADR-001, 005 |
| RNF-081 | Downgrade não destrutivo | Nunca apagar dados por plano | ADR-004 |
| RNF-082 | Documento emitido imutável | Freeze na emissão | ADR-005, 008 |

> **Nota:** LGPD não é citada nominalmente nos ADRs/architecture atuais; o mais próximo é auditoria, imutabilidade de documento e não-destruição de dados.

### 6.9 Testes

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-100 | Pirâmide | Unit (service/validator) → integration → E2E depois | architecture/009 |
| RNF-101 | Testes no módulo | `modules/<feature>/tests/` | architecture/009 |
| RNF-102 | Quota testável | Poucos call sites de `assertPlanCapacity` | ADR-004 |

### 6.10 Design system e UX

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-110 | Tailwind v4 + shadcn + tokens | `config/theme.ts` | architecture/010 |
| RNF-111 | Storybook-first (UI genérica) | `.storybook/` → `src/components/` | architecture/010 |
| RNF-112 | Domínio vs genérico | Sem hex soltos nos módulos | architecture/010 |
| RNF-123 | Forms RHF + Zod | Sem field state em `useState` | architecture/011 |
| RNF-140 | Estado | Server → TanStack Query; client → Zustand (sem domínio) | Arquitetura |

### 6.11 Quotas

| ID | Título | Descrição | Fonte |
|----|--------|-----------|-------|
| RNF-130 | Modo over_limit | Banner; bloqueia só aumento de uso | ADR-004 |
| RNF-131 | Fonte da verdade no service | UI só UX; service enforça | ADR-004 |

---

## 7. Restrições e fora de escopo

### 7.1 Restrições arquiteturais (obrigatórias)

1. Page → Action → Service → Repository → Drizzle.  
2. Domínio só em `src/modules/<feature>/` (lista canônica em AGENTS.md).  
3. Sem cross-import de internals; comunicação via actions/services/`core/events`.  
4. Dados de domínio **nunca** no Zustand.  
5. SQL só em repositories / `src/db`.  
6. Assinatura SaaS e charges clínicos **nunca** no mesmo modelo.  

### 7.2 Restrições de produto (MVP)

1. Charge 1:1 com appointment (sem cobrança avulsa).  
2. Assinatura 1:1 owner ↔ clínica owned.  
3. Receita: print HTML; sem PDF/storage; ≤ 3 templates; blocos empilhados (sem canvas livre).  
4. SSE hub in-process (multi-instância limitada).  
5. Pagamento clínico manual (sem gateway).  
6. Sem dual-role RBAC (owner + perfil clínico ≠ membership doctor).  

### 7.3 Explicitamente não planejado neste ciclo

- Reescrever arquitetura de camadas.  
- Misturar SaaS e faturamento clínico.  
- Apagar dados em downgrade.  
- Portal do paciente.  

---

## 8. Matriz RF × persona

Visão resumida (✓ = usa ativamente; · = parcial / leitura; — = fora):

| Área | P1 Owner | P2 Recepção | P3 Médico | P4 Enfermeira | P5 Financeiro | P6 Admin | P7 Manager |
|------|:--------:|:-----------:|:---------:|:-------------:|:-------------:|:--------:|:----------:|
| Auth / conta | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Assinatura SaaS | ✓ | — | — | — | — | · | — |
| Equipe / convites | ✓ | — | — | — | — | ✓ | ✓ |
| Profissionais | ✓ | — | — | — | — | ✓ | ✓ |
| Pacientes | ✓ | ✓ | ✓ | · | · | ✓ | ✓ |
| Agenda | ✓ | ✓ | ✓* | ✓* | — | ✓ | ✓ |
| Attendance / prontuário | ✓† | — | ✓ | ✓ | — | · | · |
| Board / SSE | · | ✓ | — | — | — | · | · |
| Cobrar (collect) | ✓ | ✓ | · | — | ✓ | ✓ | ✓ |
| `/billing` (view) | ✓ | — | — | — | ✓ | ✓ | — |
| Settings / audit | ✓ | — | — | — | — | ✓ | — |
| Help | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

\* self-schedule † se perfil clínico (P10)

Matriz de permissões detalhada: [RBAC](RBAC-e-Permissoes).

---

## 9. Rastreabilidade

| Artefato | Path |
|----------|------|
| Visão | [Visao-do-Produto](Visao-do-Produto) |
| Épicos | [Epicos](Epicos) E1–E12 |
| Features | [Catalogo-de-Features](Catalogo-de-Features) |
| Domínios | páginas `Dominio-*` |
| ADRs | `docs/adr/001` … `008` · [Índice](Indice-de-Decisoes) |
| Arquitetura normativa | `architecture/001` … `012` |
| Glossário | [Glossario](Glossario) |
| Diagramas | [Diagramas](Diagramas) |
| Ambientes | [Ambientes-e-Operacao](Ambientes-e-Operacao) |

### Épico ↔ blocos RF

| Épico | Blocos RF |
|-------|-----------|
| E1 Plataforma | AUTH, CLI, USR, SYS |
| E2 SaaS | SAAS |
| E3 Cadastros | PAC, PRO |
| E4 Agenda | AGE |
| E5 Prontuário | PRT |
| E6 Recebíveis | FAT |
| E7 Recepção | REC, parte AGE/DASH |
| E8 Governança | AUD, SET, HELP, DASH |
| E9 Marketing | MKT |
| E10 Gateway clínico | FAT-007 |
| E11 Inventário | INV |
| E12 Escala realtime / multi-owner | REC-007, SAAS-010 |

---

*Documento gerado em 2026-07-28 a partir do código e da documentação existente. Manter via skill `system-docs-sync`.*
