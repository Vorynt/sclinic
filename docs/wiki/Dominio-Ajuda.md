# Domínio — Ajuda (help center)

**Módulo:** `src/modules/help/` · **Épico:** E8 · **Rota:** `/help`

## Responsabilidade

Central de ajuda in-app para **todos os papéis** autenticados no dashboard: FAQ curado em português **por `roleKey`**, busca e filtros por assunto, atalhos para telas reais do produto, e tour guiado da navegação no primeiro acesso.

Sem LLM — o conteúdo vive em `constants/faq/<papel>.ts` e deve ser atualizado quando o comportamento observável do produto mudar.

## Features

| Feature | Status | Onde |
|---------|--------|------|
| FAQ por papel (owner, admin, manager, receptionist, clinician, nurse, financial) | Done | `getHelpFaqForRole` + `HELP_FAQ_BY_ROLE` |
| FAQ por categorias (linguagem simples) | Done | `HELP_CATEGORIES` + artigos do papel |
| Busca client-side (sem acento) | Done | `utils/search-faq.ts` |
| Accordion perguntas/respostas + passos | Done | `HelpFaqList` |
| Atalhos para telas reais | Done | `relatedRoutes` |
| Deep link `?q=&category=&article=` | Done | `HelpCenter` |
| Filtro esconde assuntos sem artigos no papel | Done | `HelpCategoryFilter` |
| Item Ajuda no overflow da nav (sem permissão extra) | Done | `nav.ts` `enabled: true` |
| Atalho Ajuda nas homes por papel | Done | `*Home.tsx` |
| Tour guiado no 1º acesso ao dashboard | Done | `ProductTourHost` + `driver.js`; passos filtrados pela nav visível |
| Replay do tour | Done | CTA “Ver tour do sistema” em `HelpCenter` |

## Regras

- Disponível no dashboard sem permissão extra (como `/home`).
- Copy voltado ao papel da membership ativa: sem jargão técnico; só fluxos que o papel realmente usa.
- FAQ de conta (`SHARED_ACCOUNT_FAQ`) cobre 2FA e encerrar sessões em outros dispositivos.
- Papel desconhecido → fallback no FAQ do `owner`.
- Não importa internals de outros módulos; rotas via `@/config/routes`. Persistência do tour via `authService.completeProductTour` (campo em `user`).
- Tour só no `AppShell` (não no onboarding SaaS nem no attendance). Modal **Ver tutorial** / **Agora não**. Pular, fechar no meio ou concluir marca `productTourCompleted` — não insiste. Usuários já existentes na migration nascem com o flag ligado.
- Passos destacam a chrome (Início, Agenda, Pacientes, Mais, clínica, menu da conta), sem navegar entre páginas. Overflow descreve os destinos visíveis daquele papel.
- Enquanto o prompt/tour estiver aberto, o nudge de 2FA não aparece.

## Arquivos-chave

- `src/modules/help/constants/faq/index.ts`
- `src/modules/help/constants/faq/{owner,admin,manager,receptionist,clinician,nurse,financial}.ts`
- `src/modules/help/constants/product-tour.ts`
- `src/modules/help/components/ProductTourHost.tsx`
- `src/modules/help/components/HelpCenter.tsx`
- `src/app/(dashboard)/help/page.tsx`
- `src/modules/dashboard/constants/nav.ts`

## Ver também

- [Dashboard e settings](Dominio-Dashboard-e-Settings)
- [Autenticação](Dominio-Autenticacao)
- [Rotas e navegação](Rotas-e-Navegacao)
