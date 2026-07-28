# Domínio — Ajuda (help center)

**Módulo:** `src/modules/help/` · **Épico:** E8 · **Rota:** `/help`

## Responsabilidade

Central de ajuda in-app para **todos os papéis** autenticados no dashboard: FAQ curado em português **por `roleKey`**, busca e filtros por assunto, e atalhos para telas reais do produto.

Sem LLM — o conteúdo vive em `constants/faq/<papel>.ts` e deve ser atualizado quando o comportamento observável do produto mudar.

## Features

| Feature | Status | Onde |
|---------|--------|------|
| FAQ por papel (owner, admin, manager, receptionist, doctor, nurse, financial) | Done | `getHelpFaqForRole` + `HELP_FAQ_BY_ROLE` |
| FAQ por categorias (linguagem simples) | Done | `HELP_CATEGORIES` + artigos do papel |
| Busca client-side (sem acento) | Done | `utils/search-faq.ts` |
| Accordion perguntas/respostas + passos | Done | `HelpFaqList` |
| Atalhos para telas reais | Done | `relatedRoutes` |
| Deep link `?q=&category=&article=` | Done | `HelpCenter` |
| Filtro esconde assuntos sem artigos no papel | Done | `HelpCategoryFilter` |
| Item Ajuda na sidebar (sem permissão extra) | Done | `nav.ts` `enabled: true` |
| Atalho Ajuda nas homes por papel | Done | `*Home.tsx` |

## Regras

- Disponível no dashboard sem permissão extra (como `/home`).
- Copy voltado ao papel da membership ativa: sem jargão técnico; só fluxos que o papel realmente usa.
- Papel desconhecido → fallback no FAQ do `owner`.
- Não importa internals de outros módulos; rotas via `@/config/routes`.

## Arquivos-chave

- `src/modules/help/constants/faq/index.ts`
- `src/modules/help/constants/faq/{owner,admin,manager,receptionist,doctor,nurse,financial}.ts`
- `src/modules/help/components/HelpCenter.tsx`
- `src/app/(dashboard)/help/page.tsx`
- `src/modules/dashboard/constants/nav.ts`
