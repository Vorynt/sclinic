# Domínio — Marketing

**Módulo:** `src/modules/marketing/` · **Épico:** E9

## Escopo

Landing pública `/` para captação: nav, hero (CTA teste grátis), faixa de confiança, benefícios, funcionalidades de destaque, showcase com mocks do produto, CTA final e footer.

Páginas legais públicas (rascunhos com placeholders da empresa; revisão jurídica obrigatória):

- `/termos` — Termos de Uso
- `/privacidade` — Política de Privacidade (LGPD)

Copy dos documentos em `constants/terms-of-use.ts` e `constants/privacy-policy.ts`; UI de leitura em `components/LegalDocument.tsx` / `LegalDocumentBody.tsx`. Links no footer da landing.

Soft navigation (ex.: links no sign-up) abre o documento em modal via Parallel + Intercepting Routes (`src/app/@modal/(.)termos`, `(.)privacidade`); hard navigation / refresh mostra a página completa.

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
| Footer | Copyright + Termos + Privacidade |

Não validar mocks do showcase como dados reais do produto.
