import type { ReactNode } from "react";
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-secondary-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
