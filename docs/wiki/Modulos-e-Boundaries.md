# Módulos e boundaries

## Lista de módulos

| Módulo | Responsabilidade | Maturidade |
|--------|------------------|------------|
| `authentication` | Sessão, guards, permissões runtime | Done |
| `clinics` | Clínica, hours, switcher, create/delete | Done |
| `users` | Equipe, convites, conta | Done |
| `patients` | Cadastro e detalhe do paciente | Done (**referência canônica**) |
| `professionals` | Convite e perfil clínico | Done |
| `appointments` | Agenda, status, attendance shell | Done |
| `medical-records` | Notas, vitais, alertas, receitas | Done |
| `billing` | SaaS + charges clínicos | Done |
| `dashboard` | Shell, nav, homes por role, board | Done |
| `settings` | Nav/shell de configurações | Done (fino) |
| `audit` | Leitura + emissão via events | Done |
| `marketing` | Landing | Done |
| `inventory` | Reservado | Deferred |

## Boundaries de import

- Um módulo **não** importa internals de outro.
- Comunicação: actions/services públicos ou `core/events`.
- Alias `@/` sempre.

## Anatomia típica de um módulo

```
modules/<feature>/
  actions/  schemas/  dto/  services/  repositories/
  queries/  mutations/  hooks/  components/
  types/  constants/  mappers/  tests/
```

Espelhar `patients` ao criar feature nova.

## Onde NÃO colocar

| Evitar | Preferir |
|--------|----------|
| Domínio em `src/components/` | `modules/<feature>/components/` |
| SQL na page/action | repository |
| Domínio no Zustand | TanStack Query / server |
| `shared/components` espelhado | topo `src/components/` |

Ver `architecture/001`–`003`.
