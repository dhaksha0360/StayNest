import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
export function MetricCard({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  note?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>
            {note && (
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            )}
          </div>
          <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <Icon size={19} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
