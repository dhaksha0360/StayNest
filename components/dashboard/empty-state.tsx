import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center rounded-xl border border-dashed bg-card p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Icon size={23} />
        </span>
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {action && href && (
          <Link href={href} className={buttonVariants({ className: "mt-5" })}>
            {action}
          </Link>
        )}
      </div>
    </div>
  );
}
