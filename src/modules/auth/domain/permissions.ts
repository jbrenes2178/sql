export const ROLE_CODES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "OPTOMETRIST",
  "SALES",
  "CASHIER",
  "INVENTORY",
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

export const PERMISSION_CODES = [
  "users.read",
  "users.create",
  "users.update",
  "users.disable",
  "users.assign_role",
  "branches.read",
  "branches.create",
  "branches.update",
  "audit.read",
  "organization.read",
  "pos_terminals.read",
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export const PERMISSION_CATALOG: Array<{
  code: PermissionCode;
  name: string;
  description: string;
}> = [
  { code: "users.read", name: "Ver usuarios", description: "Listar usuarios de la organización" },
  { code: "users.create", name: "Crear usuarios", description: "Crear usuarios internos" },
  { code: "users.update", name: "Editar usuarios", description: "Actualizar datos de usuarios" },
  { code: "users.disable", name: "Deshabilitar usuarios", description: "Desactivar cuentas" },
  { code: "users.assign_role", name: "Asignar roles", description: "Asignar o quitar roles" },
  { code: "branches.read", name: "Ver sucursales", description: "Listar sucursales y terminales" },
  { code: "branches.create", name: "Crear sucursales", description: "Crear sucursales" },
  { code: "branches.update", name: "Editar sucursales", description: "Actualizar sucursales" },
  { code: "audit.read", name: "Ver auditoría", description: "Consultar bitácora" },
  { code: "organization.read", name: "Ver organización", description: "Ver datos de la empresa" },
  { code: "pos_terminals.read", name: "Ver terminales POS", description: "Listar cajas" },
];

export const ROLE_PERMISSIONS: Record<RoleCode, readonly PermissionCode[]> = {
  SUPER_ADMIN: PERMISSION_CODES,
  ADMIN: PERMISSION_CODES,
  MANAGER: [
    "users.read",
    "users.create",
    "users.update",
    "users.assign_role",
    "branches.read",
    "branches.update",
    "audit.read",
    "organization.read",
    "pos_terminals.read",
  ],
  OPTOMETRIST: ["organization.read", "branches.read"],
  SALES: ["organization.read", "branches.read"],
  CASHIER: ["organization.read", "branches.read", "pos_terminals.read"],
  INVENTORY: ["organization.read", "branches.read"],
};

export const ROLE_LABELS: Record<RoleCode, string> = {
  SUPER_ADMIN: "Super administrador",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  OPTOMETRIST: "Optometrista",
  SALES: "Ventas",
  CASHIER: "Cajero",
  INVENTORY: "Inventario",
};
