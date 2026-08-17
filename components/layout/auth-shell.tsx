import Image from "next/image";
import { ShieldCheck, Star } from "lucide-react";
import { Logo } from "@/components/shared/logo";
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-card lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Image
          src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1500&q=85"
          alt="StayNest villa"
          fill
          priority
          className="object-cover"
          sizes="55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#10263a]/75 via-[#10263a]/20 to-[#10263a]/90" />
        <div className="relative">
          <Logo inverse />
        </div>
        <div className="relative max-w-xl">
          <div className="flex gap-1 text-amber-300">
            {[1, 2, 3, 4, 5].map((x) => (
              <Star key={x} size={15} className="fill-current" />
            ))}
          </div>
          <blockquote className="mt-5 text-3xl font-medium leading-tight tracking-tight">
            “Every detail felt considered—from booking to the moment we
            arrived.”
          </blockquote>
          <p className="mt-4 text-sm text-slate-200">
            StayNest guest · Galle, Sri Lanka
          </p>
          <div className="mt-7 flex items-center gap-2 text-xs text-slate-200">
            <ShieldCheck size={16} className="text-teal-300" /> Secure bookings
            and verified properties
          </div>
        </div>
      </section>
      <section className="flex flex-col">
        <div className="p-5 lg:hidden">
          <Logo />
        </div>
        <div className="grid flex-1 place-items-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-secondary-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
