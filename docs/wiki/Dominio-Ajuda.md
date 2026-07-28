# Domínio — Ajuda (help center)

**Módulo:** `src/modules/help/` · **Épico:** E8 · **Rota:** `/help`

## Responsabilidade

Central de ajuda in-app para o proprietário (e demais usuários autenticados no dashboard): FAQ curado em português, busca e filtros por assunto, ilustrações com elementos do design system e atalhos para telas reais do produto.

Sem LLM — o conteúdo vive em `constants/faq.ts` e deve ser atualizado quando o comportamento observável do produto mudar.

## Features

| Feature | Status | Onde |
|---------|--------|------|
| FAQ por categorias (linguagem simples) | Done | `HELP_FAQ` + `HELP_CATEGORIES` |
| Busca client-side (sem acento) | Done | `utils/search-faq.ts` |
| Accordion perguntas/respostas + passos | Done | `HelpFaqList` |
| Atalhos para telas reais | Done | `relatedRoutes` |
| Deep link `?q=&category=&article=` | Done | `HelpCenter` |
| Item Ajuda na sidebar | Done | `nav.ts` `enabled: true` |
| Atalho na home do owner | Done | `OwnerHome` |

## Regras

- Disponível no dashboard sem permissão extra (como `/home`).
- Copy voltado ao dono da clínica: sem jargão técnico.
- Não importa internals de outros módulos; rotas via `@/config/routes`.

## Arquivos-chave

- `src/modules/help/constants/faq.ts`
- `src/modules/help/components/HelpCenter.tsx`
- `src/app/(dashboard)/help/page.tsx`
- `src/modules/dashboard/constants/nav.ts`
