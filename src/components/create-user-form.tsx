"use client";

import { useState } from "react";

import { createUserAction } from "@/modules/users/application/user-actions";
import { ROLE_CODES, ROLE_LABELS, type RoleCode } from "@/modules/auth/domain/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateUserForm({
  branches,
  canAssignSuperAdmin,
}: {
  branches: Array<{ id: string; name: string }>;
  canAssignSuperAdmin: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const roles = ROLE_CODES.filter((code) => canAssignSuperAdmin || code !== "SUPER_ADMIN");

  async function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    const result = await createUserAction(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Usuario creado");
  }

  return (
    <form action={onSubmit} className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" minLength={12} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="roleCode">Rol inicial</Label>
        <select
          id="roleCode"
          name="roleCode"
          className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          defaultValue="SALES"
        >
          {roles.map((code: RoleCode) => (
            <option key={code} value={code}>
              {ROLE_LABELS[code]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="defaultBranchId">Sucursal</Label>
        <select
          id="defaultBranchId"
          name="defaultBranchId"
          className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">Sin sucursal por defecto</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit">Crear usuario</Button>
      </div>
      {error ? <p className="text-sm text-red-700 md:col-span-2">{error}</p> : null}
      {message ? <p className="text-sm text-teal-800 md:col-span-2">{message}</p> : null}
    </form>
  );
}
