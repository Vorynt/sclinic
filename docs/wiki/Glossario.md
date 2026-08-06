# Glossário

| Termo | Definição |
|-------|-----------|
| **Clinic / clínica** | Tenant operacional; dados escopados por `clinicId` |
| **Membership** | Vínculo user ↔ clínica com role (`active` / `suspended` / `removed`) |
| **Owner** | Papel que cria a clínica e paga a assinatura SaaS |
| **Perfil clínico** | Registro em `professionals` agendável; pode coexistir com membership `owner` (ADR-007) — não é dual-role RBAC |
| **Profissional de saúde** | Papel RBAC `clinician` (capabilities clínicas) **ou** o profissional na agenda; na UI o termo genérico cobre médico, dentista, fisio, etc. |
| **Tipo de profissão** | `profession_type` no perfil: physician, dentist, physiotherapist, nurse, pharmacist, psychologist, other (ADR-012) |
| **Entitled** | Assinatura viva: `trialing` \| `active` \| `past_due` |
| **Over limit** | Uso > cotas do plano após downgrade; não derruba sessão |
| **Charge** | Cobrança clínica 1:1 com appointment (ADR-002) |
| **Serviço (clínica)** | Item do catálogo da clínica com preço fixo; precifica a consulta (ADR-009) |
| **Billing kind** | Motivo da cobrança: `standard` \| `courtesy` \| `return` (ADR-009) |
| **Attendance** | Workspace de atendimento `/appointments/[id]/attendance` |
| **Prescription** | Receita médica (`draft` → `issued`) |
| **Prescription template** | Modelo de timbrado da clínica (até 3); DocumentModel de blocos → HTML |
| **Board** | Painel operacional da recepção (ADR-006) |
| **SSE** | Server-Sent Events em `/api/realtime/clinic` |
| **ADR** | Architecture Decision Record em `docs/adr/` |
| **Module** | Pasta `src/modules/<feature>/` com boundaries |
| **Server Action** | Entrypoint `"use server"` que valida e delega ao service |
| **Soft delete** | Arquivamento / suspended / canceled sem hard delete |
| **Living subscription** | Assinatura SaaS não terminal do user |
| **Self-schedule** | Clinician/nurse só veem/agendam a si |
| **Collect** | Permissão `financial.collect` — cobrar sem ver lista `/billing` |
