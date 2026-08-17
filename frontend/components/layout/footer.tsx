import Link from "next/link";
import { Globe2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
const columns = [
  ["Explore", ["Properties", "/properties"], ["Destinations", "/properties"]],
  ["Company", ["About", "/about"], ["Contact", "/contact"]],
  [
    "Support",
    ["Help centre", "/contact"],
    ["Cancellation policy", "/about"],
    ["Privacy", "/about"],
    ["Terms", "/about"],
  ],
];
export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Thoughtfully selected stays, transparent booking, and hospitality
            you can trust.
          </p>
        </div>
        {columns.map(([title, ...links]) => (
          <div key={title as string}>
            <h3 className="text-sm font-semibold">{title as string}</h3>
            <div className="mt-4 space-y-2.5">
              {links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 StayNest. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <Globe2 size={14} /> English · USD
          </span>
        </div>
      </div>
    </footer>
  );
}
