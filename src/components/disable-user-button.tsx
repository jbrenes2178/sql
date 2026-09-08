"use client";

import { useState, useTransition } from "react";

import { disableUserAction } from "@/modules/users/application/user-actions";
import { Button } from "@/components/ui/button";

export function DisableUserButton({ userId }: { userId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => {
          const formData = new FormData();
          formData.set("userId", userId);
          startTransition(async () => {
            const result = await disableUserAction(formData);
            if (!result.ok) {
              setError(result.error);
            }
          });
        }}
      >
        Deshabilitar
      </Button>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
