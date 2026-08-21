# Domínio — Pacientes

**Módulo:** `src/modules/patients/` · **Épico:** E3 · **Referência canônica de estrutura de módulo**

## Responsabilidade

Referência canônica de estrutura de módulo.

## Features

- Lista paginada + busca + CRUD (`/patients`)
- Detalhe: resumo, profile, appointments, notes, vitals, prescriptions
- Observações administrativas no cadastro (`patients.notes`) — não são prontuário
- Soft delete → `archived`
- **Planned (H1 · E14):** overview consolidado (última/próxima consulta, financeiro resumido, alertas)
- **Planned (H3 · E14):** pacientes inativos por última consulta + CTA

Ver [Roadmap](Roadmap).

## Regras

- Perms: `patients.read` / `patients.write`
- CPF único **por clínica**
- Update exige ≥ 1 campo
- Abas clínicas exigem `records.read` (não confundir com cadastro)
- Observações administrativas (`notes`) são do cadastro (`patients.write`); evolução clínica fica no prontuário
- Escopo estrito por `clinicId`

## Schema (create)

| Campo | Regra |
|-------|-------|
| name | obrigatório ≤ 200 |
| cpf | obrigatório, válido |
| phone, email, birthDate | opcionais |
| emergencyContact* | opcionais |
| notes | opcional ≤ 1000; string vazia grava `null` (notas administrativas, não prontuário) |

Status: `active` | `inactive` | `archived`.

## Decisões relacionadas

Módulo referência: `patients` como template (`architecture/001`).

## Ver também

- [Prontuário](Dominio-Prontuario)
- [Agendamentos](Dominio-Agendamentos)
- [RBAC e permissões](RBAC-e-Permissoes)
- [Roadmap](Roadmap)
- [Módulos e boundaries](Modulos-e-Boundaries)
