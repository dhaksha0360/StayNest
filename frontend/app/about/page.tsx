import { Navbar } from "@/components/navbar";
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Footer } from "@/components/layout/footer";
export default function About() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-primary px-5 py-24 text-white">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold tracking-[.18em] text-teal-300">
              OUR PURPOSE
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-.04em] md:text-7xl">
              Better stays begin with trust.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              StayNest brings guests and property managers together through
              transparent pricing, verified records, secure payments, and
              thoughtful communication.
            </p>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-20 md:grid-cols-3">
          {[
            [
              ShieldCheck,
              "Built for confidence",
              "Availability and pricing are verified by the server before every reservation.",
            ],
            [
              HeartHandshake,
              "Human hospitality",
              "Guests communicate directly with the people responsible for their stay.",
            ],
            [
              Sparkles,
              "Quality by design",
              "Every workflow is designed to feel calm, clear, and dependable.",
            ],
          ].map(([Icon, title, text]) => (
            <article
              key={title as string}
              className="rounded-xl border bg-card p-8"
            >
              <Icon className="text-secondary-foreground" size={28} />
              <h2 className="mt-7 text-xl font-semibold">{title as string}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {text as string}
              </p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
