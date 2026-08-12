# Domínio — Marketing

**Módulo:** `src/modules/marketing/` · **Épico:** E9

## Escopo

Landing pública `/` para captação: nav, hero (CTA teste grátis), faixa de confiança, benefícios, funcionalidades de destaque, showcase com mocks do produto, CTA final e footer.

Hub e páginas legais públicas (rascunhos com placeholders da empresa; revisão jurídica obrigatória):

- `/legal` — índice (Serviço / Contratual / Governança)
- `/termos` — Termos de Uso
- `/privacidade` — Política de Privacidade (LGPD)
- `/cookies` — Política de Cookies
- `/contrato-saas` — Contrato SaaS
- `/dpa` — DPA / Acordo de Tratamento de Dados
- `/seguranca` — Política de Segurança da Informação
- `/retencao` — Política de Retenção e Exclusão
- `/incidentes` — Procedimento de Resposta a Incidentes
- `/ropa` — Template ROPA

Registry em `constants/legal-documents.ts`; copy por documento em `constants/*.ts` (alinhada às features live: multi-tenant, RBAC, prontuário operacional, cobrança clínica manual, Stripe SaaS, Neon/Vercel/Resend; sem inventário/gateway clínico/portal do paciente); UI em `LegalDocument.tsx` / `LegalDocumentBody.tsx` (suporta tabelas) e hub em `LegalDocumentsHub.tsx`. Footer aponta para `/legal` + atalhos Termos/Privacidade.

Soft navigation (ex.: links no sign-up) abre Termos/Privacidade em modal via Parallel + Intercepting Routes (`src/app/@modal/(.)termos`, `(.)privacidade`); hard navigation / refresh mostra a página completa. Demais documentos usam apenas página completa.

- Sem backend de domínio
- CTAs → sign-up (teste grátis) / login
- Copy em `constants/landing-copy.ts`
- Mocks em `components/mocks/` (agenda, pacientes, atendimento, faturamento)

## Seções (conversão)

| Seção | Objetivo |
|-------|----------|
| Hero | Marca + proposta de valor + teste grátis |
| Trust | Sinais (LGPD, papéis, multi-profissional) |
| Benefícios | Tempo, organização, segurança, equipe |
| Funcionalidades | Agenda, pacientes, atendimento, faturamento |
| Showcase | UI real do produto via mocks |
| CTA | Conversão final para sign-up |
| Footer | Copyright + coluna Documentos (hub + lista dos 9 docs) |

Não validar mocks do showcase como dados reais do produto.
