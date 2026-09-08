import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: "default" | "success" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-slate-100 text-slate-800",
        variant === "success" && "bg-teal-100 text-teal-900",
        variant === "muted" && "bg-slate-50 text-slate-500",
        className,
      )}
      {...props}
    />
  );
}
