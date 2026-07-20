# 009 — Testing

## Localização

Testes do domínio em `modules/<feature>/tests/`.

## Pirâmide

- Unit: services, validators, utils, mappers.
- Integration: repositories (com DB de teste) e actions.
- E2E: fluxos críticos (auth, agendamento, etc.) — fase posterior.

## Regras

- Services devem ser testáveis sem UI.
- Repositories mockáveis ou com banco isolado.
- Não testar detalhes de implementação de componentes visuais no início; priorizar domínio.
