# 008 — Error Handling

## Princípios

- Erros de domínio tipados em `shared/errors/`.
- Actions traduzem erros de serviço em respostas previsíveis para a UI.
- `ApiClient` centraliza tratamento de erros HTTP.
- Nunca engolir erros sem log (`core/logger`).

## Padrão sugerido

1. Repository lança erros técnicos (DB).
2. Service lança/erro mapeia para erros de domínio.
3. Action captura e retorna `{ success, data | error }`.
4. UI exibe via Toast / form feedback.
