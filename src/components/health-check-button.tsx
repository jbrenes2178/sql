"use client";

import { enqueueHealthCheckAction } from "@/modules/organization/application/job-actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function HealthCheckButton() {
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    const result = await enqueueHealthCheckAction();
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(result.data.jobId ? `Trabajo encolado: ${result.data.jobId}` : "Trabajo encolado");
  }

  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="secondary" onClick={() => void onClick()}>
        Encolar health-check
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
