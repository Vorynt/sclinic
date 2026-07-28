# Domínio — Pacientes

**Módulo:** `src/modules/patients/` · **Épico:** E3 · **Referência canônica de estrutura de módulo**

## Features

- Lista paginada + busca + CRUD (`/patients`)
- Detalhe: resumo, profile, appointments, notes, vitals, prescriptions
- Soft delete → `archived`

## Regras

- Perms: `patients.read` / `patients.write`
- CPF único **por clínica**
- Update exige ≥ 1 campo
- Abas clínicas exigem `records.read` (não confundir com cadastro)
- Escopo estrito por `clinicId`

## Schema (create)

| Campo | Regra |
|-------|-------|
| name | obrigatório ≤ 200 |
| cpf | obrigatório, válido |
| phone, email, birthDate | opcionais |
| emergencyContact* | opcionais |

Status: `active` | `inactive` | `archived`.
