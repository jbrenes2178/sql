import { z } from "zod";

import { ROLE_CODES } from "@/modules/auth/domain/permissions";

export const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(120),
  email: z.string().trim().email("Correo inválido"),
  password: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres")
    .max(128),
  roleCode: z.enum(ROLE_CODES),
  defaultBranchId: z.string().uuid().optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  defaultBranchId: z.string().uuid().optional().or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const disableUserSchema = z.object({
  userId: z.string().uuid(),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleCode: z.enum(ROLE_CODES),
});

export const createBranchSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, "Código alfanumérico"),
  timezone: z.string().trim().min(1).default("America/Costa_Rica"),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = z.object({
  branchId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  timezone: z.string().trim().min(1),
  active: z.boolean(),
});

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
