import Link from "next/link";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/api";
export function Logo({
  inverse = false,
  className,
}: {
  inverse?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-lg font-semibold tracking-tight",
        inverse ? "text-white" : "text-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg",
          inverse
            ? "bg-white text-primary"
            : "bg-primary text-primary-foreground",
        )}
      >
        <Building2 size={17} />
      </span>
      StayNest
    </Link>
  );
}
