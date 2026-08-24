# Domínio — Marketing

**Módulo:** `src/modules/marketing/` · **Épico:** E9

## Responsabilidade

Landing pública `/` para captação: nav (pill da seção ativa + barra de progresso de scroll), hero em split (copy + mock com tilt; sinais de confiança no próprio hero), benefícios em timeline com progresso no scroll, funcionalidades em bento, showcase com tour sticky/clicável, CTA editorial e footer.

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
- Mocks em `components/mocks/` espelham o chrome atual (top nav do AppShell; atendimento no AttendanceShell quieto — sem sidebar)
- Animações da landing: Motion (`motion/react`) com `prefers-reduced-motion` (Reveal, tilt 3D do mock no hero, timeline de benefícios, hover lift, tour sticky no showcase desktop)

## Seções (conversão)

| Seção | Objetivo |
|-------|----------|
| Hero | Split: proposta de valor + CTAs + pills de confiança; mock da agenda à direita (desktop) |
| Benefícios | Tempo, organização, segurança, equipe (timeline com linha de progresso) |
| Funcionalidades | Agenda, pacientes, atendimento, faturamento (bento assimétrico) |
| Showcase | UI atual do produto via mocks (tour sticky + steps clicáveis no desktop) |
| CTA | Conversão final para sign-up (bloco editorial em duas colunas) |
| Footer | Copyright + coluna Documentos (hub + lista dos 9 docs) |

Não validar mocks do showcase como dados reais do produto.

## Ver também

- [Autenticação](Dominio-Autenticacao)
- [Rotas e navegação](Rotas-e-Navegacao)
- [Visão do produto](Visao-do-Produto)
