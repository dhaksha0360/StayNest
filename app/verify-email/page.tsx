"use client";
import axios from "axios";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
function Verify() {
  const sp = useSearchParams();
  const url = sp.get("url");
  const [state, setState] = useState<"loading" | "success" | "error">(
    url ? "loading" : "error",
  );
  useEffect(() => {
    if (!url) return;
    axios
      .get(url, { headers: { Accept: "application/json" } })
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [url]);
  return (
    <>
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-5 py-20">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
            {state === "loading" ? (
              <LoaderCircle
                className="mx-auto animate-spin text-secondary-foreground"
                size={48}
              />
            ) : state === "success" ? (
              <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
            ) : (
              <XCircle className="mx-auto text-red-500" size={48} />
            )}
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              {state === "loading"
                ? "Verifying your email…"
                : state === "success"
                  ? "Email verified"
                  : "Verification failed"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {state === "success"
                ? "Your StayNest account is ready for secure bookings."
                : state === "error"
                  ? "This link is invalid or has expired. Request another from Security settings."
                  : "Please keep this window open."}
            </p>
            {state !== "loading" && (
              <Link
                href={state === "success" ? "/dashboard" : "/login"}
                className={buttonVariants({ className: "mt-7" })}
              >
                Continue
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
