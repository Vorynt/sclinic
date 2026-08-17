# Módulos e boundaries

## Lista de módulos

| Módulo | Responsabilidade | Maturidade |
|--------|------------------|------------|
| [`authentication`](Dominio-Autenticacao) | Sessão, guards, permissões runtime | Done |
| [`clinics`](Dominio-Clinicas) | Clínica, hours, switcher, create/delete | Done |
| [`users`](Dominio-Usuarios-e-Equipe) | Equipe, convites, conta | Done |
| [`patients`](Dominio-Pacientes) | Cadastro e detalhe do paciente | Done (**referência canônica**) |
| [`professionals`](Dominio-Profissionais) | Convite e perfil clínico | Done |
| [`appointments`](Dominio-Agendamentos) | Agenda, status, attendance shell | Done |
| [`medical-records`](Dominio-Prontuario) | Notas, vitais, alertas, receitas | Done |
| [`billing`](Dominio-Faturamento-Clinico) ([SaaS](Dominio-Assinatura-SaaS)) | SaaS + charges clínicos | Done |
| [`dashboard`](Dominio-Dashboard-e-Settings) | Shell, nav, homes por role, board | Done |
| [`settings`](Dominio-Dashboard-e-Settings) | Nav/shell de configurações | Done (fino) |
| [`audit`](Dominio-Auditoria) | Leitura + emissão via events | Done |
| [`marketing`](Dominio-Marketing) | Landing | Done |
| [`help`](Dominio-Ajuda) | Central de ajuda (FAQ curado) + tour guiado | Done |
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

## Ver também

- [Arquitetura](Arquitetura)
- [Pacientes](Dominio-Pacientes)
