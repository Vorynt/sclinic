# Manutenção da documentação

## Fonte da verdade

| Artefato | Path |
|----------|------|
| Wiki (handbook) | `docs/wiki/` |
| ADRs | `docs/adr/` |
| Arquitetura normativa | `architecture/` |
| Notas curtas | `.notebook/` |

Edite **sempre** `docs/wiki/` no git; depois sincronize a GitHub Wiki.

## Quando atualizar

Qualquer mudança observável: feature, regra, schema, rota, RBAC, status machine, ADR, item de roadmap.

## Checklist na entrega

1. Página de domínio / catálogo / épico / roadmap atualizados
2. Novo ADR linkado em [Índice de decisões](Indice-de-Decisoes)
3. Diagrama se o fluxo mudou
4. `npm run docs:wiki:sync` (Wiki habilitada no GitHub)

## Skill do agente

`.cursor/skills/system-docs-sync/` — invocada ao desenvolver features.

## Publicar no GitHub

1. Settings do repo → Features → **Wikis** on  
2. Criar primeira página na UI (cria `*.wiki.git`)  
3. `npm run docs:wiki:sync`  

URL: https://github.com/ViniciusSantos31/sclinic/wiki
