"use client";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/api";
export const DropdownMenu = Dropdown.Root;
export const DropdownMenuTrigger = Dropdown.Trigger;
export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof Dropdown.Content>) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-48 rounded-lg border bg-card p-1.5 text-card-foreground shadow-lg",
          className,
        )}
        {...props}
      />
    </Dropdown.Portal>
  );
}
export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof Dropdown.Item>) {
  return (
    <Dropdown.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted",
        className,
      )}
      {...props}
    />
  );
}
export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof Dropdown.Label>) {
  return (
    <Dropdown.Label
      className={cn(
        "px-3 py-2 text-xs font-semibold text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Dropdown.Separator>) {
  return (
    <Dropdown.Separator
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
