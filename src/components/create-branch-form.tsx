"use client";

import { useState } from "react";

import { createBranchAction } from "@/modules/branches/application/branch-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateBranchForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    const result = await createBranchAction(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Sucursal creada");
  }

  return (
    <form action={onSubmit} className="grid gap-3 md:grid-cols-3">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="code">Código</Label>
        <Input id="code" name="code" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="timezone">Zona horaria</Label>
        <Input id="timezone" name="timezone" defaultValue="America/Costa_Rica" required />
      </div>
      <div className="md:col-span-3">
        <Button type="submit">Crear sucursal</Button>
      </div>
      {error ? <p className="text-sm text-red-700 md:col-span-3">{error}</p> : null}
      {message ? <p className="text-sm text-teal-800 md:col-span-3">{message}</p> : null}
    </form>
  );
}
