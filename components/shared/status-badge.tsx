import { Badge } from "@/components/ui/badge";
const variants: Record<
  string,
  "success" | "warning" | "destructive" | "info" | "default"
> = {
  confirmed: "success",
  paid: "success",
  checked_in: "info",
  checked_out: "default",
  pending: "warning",
  processing: "info",
  cancelled: "destructive",
  rejected: "destructive",
  failed: "destructive",
  refunded: "default",
  partially_refunded: "warning",
  published: "success",
  archived: "default",
  new: "info",
  in_progress: "warning",
  resolved: "success",
  spam: "destructive",
};
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variants[status] ?? "default"} className="capitalize">
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
