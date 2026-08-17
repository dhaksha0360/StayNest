import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/api";
const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 ring-slate-200",
        secondary: "bg-teal-50 text-teal-700 ring-teal-200",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        warning: "bg-amber-50 text-amber-700 ring-amber-200",
        destructive: "bg-red-50 text-red-700 ring-red-200",
        info: "bg-blue-50 text-blue-700 ring-blue-200",
        outline: "bg-transparent text-foreground ring-border",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
