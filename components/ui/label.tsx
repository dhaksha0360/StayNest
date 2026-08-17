import * as React from "react";
import { cn } from "@/lib/api";
export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
