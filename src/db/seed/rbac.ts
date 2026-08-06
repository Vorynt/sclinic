/**
 * Seeds system roles + permission catalog + role_permissions matrix.
 *
 * Usage:
 *   npm run db:seed:rbac
 */
import { config } from "dotenv";
import { and, eq, isNull } from "drizzle-orm";

config({ path: ".env.local" });
config({ path: ".env" });

import { db } from "@/db";
import { permissions, rolePermissions, roles } from "@/db/schema";

const SYSTEM_ROLES = [
  {
    key: "owner",
    name: "Proprietário",
    description:
      "Proprietário da clínica — acesso completo incluindo faturamento e membros",
  },
  {
    key: "admin",
    name: "Administrador",
    description: "Administrador da clínica",
  },
  {
    key: "manager",
    name: "Gestor",
    description: "Gestor operacional",
  },
  {
    key: "receptionist",
    name: "Recepcionista",
    description: "Recepcionista — pacientes e agendamentos",
  },
  {
    key: "clinician",
    name: "Profissional de saúde",
    description: "Profissional de saúde com acesso de escrita clínica",
  },
  {
    key: "nurse",
    name: "Enfermeiro(a)",
    description: "Equipe de enfermagem",
  },
  {
    key: "financial",
    name: "Financeiro",
    description: "Faturamento e visualização financeira",
  },
] as const;

const PERMISSIONS = [
  { key: "patients.read", name: "Read patients", module: "patients" },
  { key: "patients.write", name: "Write patients", module: "patients" },
  {
    key: "appointments.create",
    name: "Create appointments",
    module: "appointments",
  },
  {
    key: "appointments.update",
    name: "Update appointments",
    module: "appointments",
  },
  {
    key: "appointments.delete",
    name: "Delete appointments",
    module: "appointments",
  },
  {
    key: "professionals.manage",
    name: "Manage professionals",
    module: "professionals",
  },
  { key: "financial.view", name: "View financial", module: "billing" },
  { key: "financial.manage", name: "Manage financial", module: "billing" },
  {
    key: "financial.collect",
    name: "Collect clinical payments",
    module: "billing",
  },
  {
    key: "settings.manage",
    name: "Manage clinic settings",
    module: "settings",
  },
  { key: "members.invite", name: "Invite members", module: "settings" },
  {
    key: "records.read",
    name: "Read medical records",
    module: "medical-records",
  },
  {
    key: "records.write",
    name: "Write medical records",
    module: "medical-records",
  },
  {
    key: "audit.read",
    name: "Read clinic audit logs",
    module: "audit",
  },
] as const;

const ROLE_PERMISSION_MATRIX: Record<string, readonly string[]> = {
  owner: PERMISSIONS.map((p) => p.key),
  admin: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
    "professionals.manage",
    "financial.view",
    "financial.manage",
    "financial.collect",
    "settings.manage",
    "members.invite",
    "records.read",
    "records.write",
    "audit.read",
  ],
  manager: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
    "professionals.manage",
    "financial.view",
    "financial.collect",
    "members.invite",
    "records.read",
  ],
  receptionist: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "appointments.delete",
    "financial.collect",
  ],
  clinician: [
    "patients.read",
    "patients.write",
    "appointments.create",
    "appointments.update",
    "records.read",
    "records.write",
    "financial.collect",
  ],
  nurse: [
    "patients.read",
    "appointments.create",
    "appointments.update",
    "records.read",
    "records.write",
  ],
  financial: [
    "patients.read",
    "financial.view",
    "financial.manage",
    "financial.collect",
  ],
};

async function ensureSystemRoles() {
  // ADR-012: rename legacy system role `doctor` → `clinician` if still present.
  const [legacyDoctor] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.key, "doctor"), isNull(roles.clinicId)))
    .limit(1)

  if (legacyDoctor) {
    const [existingClinician] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.key, "clinician"), isNull(roles.clinicId)))
      .limit(1)

    if (!existingClinician) {
      await db
        .update(roles)
        .set({
          key: "clinician",
          name: "Profissional de saúde",
          description: "Profissional de saúde com acesso de escrita clínica",
        })
        .where(eq(roles.id, legacyDoctor.id))
    }
  }

  for (const role of SYSTEM_ROLES) {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.key, role.key), isNull(roles.clinicId)))
      .limit(1);

    if (!existing) {
      await db.insert(roles).values({
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: true,
        clinicId: null,
      });
      continue;
    }

    // Keep display name/description in Portuguese even if the row already exists.
    await db
      .update(roles)
      .set({
        name: role.name,
        description: role.description,
      })
      .where(eq(roles.id, existing.id));
  }
}

async function ensurePermissions() {
  for (const permission of PERMISSIONS) {
    const [existing] = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(eq(permissions.key, permission.key))
      .limit(1);

    if (!existing) {
      await db.insert(permissions).values(permission);
    }
  }
}

async function ensureRolePermissions() {
  const allRoles = await db
    .select()
    .from(roles)
    .where(and(eq(roles.isSystem, true), isNull(roles.clinicId)));

  const allPermissions = await db.select().from(permissions);
  const permissionByKey = new Map(allPermissions.map((p) => [p.key, p.id]));

  for (const role of allRoles) {
    const keys = ROLE_PERMISSION_MATRIX[role.key] ?? [];

    for (const key of keys) {
      const permissionId = permissionByKey.get(key);
      if (!permissionId) continue;

      const [existing] = await db
        .select({ id: rolePermissions.id })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, role.id),
            eq(rolePermissions.permissionId, permissionId),
          ),
        )
        .limit(1);

      if (!existing) {
        await db.insert(rolePermissions).values({
          roleId: role.id,
          permissionId,
        });
      }
    }
  }
}

async function seed() {
  await ensureSystemRoles();
  await ensurePermissions();
  await ensureRolePermissions();
  console.log("RBAC seed completed");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
