# Diagramas

Diagramas em Mermaid (renderizam na GitHub Wiki e em vários viewers Markdown).

## 1. Camadas da aplicação

```mermaid
flowchart LR
  UI[Page / Component] --> SA[Server Action]
  SA --> SVC[Service]
  SVC --> REPO[Repository]
  REPO --> DB[(Drizzle / Neon)]
  SVC -.-> EV[core/events]
  EV -.-> AUD[audit]
  EV -.-> RT[core/realtime / SSE]
```

## 2. Onboarding e auth (pós-login)

```mermaid
flowchart TD
  A[Login / Session] --> B{mustChangePassword?}
  B -->|sim| C[/change-password]
  B -->|não| D{invite next?}
  D -->|sim| E[Aceitar invite]
  D -->|não| F{emailVerified?}
  F -->|não| G[/verify-email]
  F -->|sim| H{membership?}
  H -->|só suspended| I[/membership-inactive]
  H -->|blocked / seleção| J[/select-clinic]
  H -->|nenhuma| K[/onboarding/plan]
  H -->|ativa + entitled| L[/home]
  K --> M[/onboarding/clinic]
  M --> M2{alsoPractices?}
  M2 -->|sim| M3[Perfil clínico do owner]
  M2 -->|não| N[/onboarding/hours]
  M3 --> N
  N --> L
```

## 3. Fluxo operacional do dia (ADR-006)

```mermaid
sequenceDiagram
  participant R as Recepção
  participant A as Agenda
  participant M as Médico
  participant B as Board / SSE
  participant C as Charge

  R->>A: Cria appointment (+ serviço / amount)
  A->>C: charge pending (ou R$ 0 paid se cortesia)
  M->>A: start → checked_in
  M->>A: complete → completed
  A-->>B: clinic.ops
  B->>R: Aguardando pagamento
  R->>C: markPaid (ajuste % opcional)
  C-->>B: some da coluna pagamento
```

> ADR-009 (Planned): serviço do catálogo substitui valor digitado; cortesia/retorno não passa pela coluna de pagamento.


## 4. Máquina de status do appointment

```mermaid
stateDiagram-v2
  [*] --> scheduled
  scheduled --> confirmed: confirm
  scheduled --> checked_in: start
  confirmed --> checked_in: start
  scheduled --> no_show: no_show
  confirmed --> no_show: no_show
  checked_in --> completed: complete
  scheduled --> canceled: cancel
  confirmed --> canceled: cancel
  checked_in --> canceled: cancel
  completed --> [*]
  canceled --> [*]
  no_show --> [*]
```

## 5. Domínio financeiro (dois mundos)

```mermaid
flowchart TB
  subgraph SaaS
    U[User owner] --> Sub[subscriptions]
    Sub --> Stripe[Stripe Checkout/Portal]
    Sub --> CS[clinics.subscriptionStatus]
    CS -->|não entitled| Select[/select-clinic]
    Select -->|owner| Account[/account/subscription]
    Select -->|owner delete| Cancel[cancel Stripe + soft-delete]
  end
  subgraph Clinico
    Ap[appointment] --> Ch[charges]
    Ch --> Pay[payments]
  end
  SaaS -.->|não misturar| Clinico
```

## 6. Mapa de módulos (lógico)

```mermaid
flowchart TB
  auth[authentication] --> clinics
  auth --> users
  clinics --> patients
  clinics --> professionals
  patients --> appointments
  professionals --> appointments
  appointments --> records[medical-records]
  appointments --> billing
  billing --> dash[dashboard board]
  records --> dash
  audit[audit] -.->|events| patients & appointments & billing
```

Mais detalhes nas páginas de domínio e ADRs.
