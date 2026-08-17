"use client";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { persistSession } from "@/lib/session";
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});
const registerSchema = z
  .object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    password: z.string().min(8),
    password_confirmation: z.string(),
  })
  .refine((x) => x.password === x.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const schema = mode === "login" ? loginSchema : registerSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const submit = handleSubmit(async (d) => {
    try {
      const { data } = await api.post(`/${mode}`, d);
      persistSession(data.data.token, data.data.user);
      toast.success(data.message);
      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      router.push(next || "/dashboard");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Unable to continue");
    }
  });
  const input = (name: string, label: string, type = "text") => (
    <Label className="block">
      {label}
      {mode === "register" && name !== "email" ? (
        <span className="ml-1 text-destructive">*</span>
      ) : null}
      <div className="relative mt-2">
        <Input
          type={type === "password" && showPassword ? "text" : type}
          {...register(name as never)}
          aria-invalid={!!(errors as any)[name]}
          className={type === "password" ? "pr-10" : ""}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      <span className="mt-1.5 block min-h-4 text-xs font-normal text-destructive">
        {(errors as any)[name]?.message}
      </span>
    </Label>
  );
  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {input("first_name", "First name")}
          {input("last_name", "Last name")}
        </div>
      )}
      {input("email", "Email address", "email")}
      {mode === "register" && input("phone", "Phone number", "tel")}
      {input("password", "Password", "password")}
      {mode === "login" && (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            {...register("remember" as never)}
            className="size-4 accent-teal-600"
          />
          Keep me signed in on this device
        </label>
      )}
      {mode === "login" && (
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-bold text-teal-700"
          >
            Forgot password?
          </Link>
        </div>
      )}
      {mode === "register" &&
        input("password_confirmation", "Confirm password", "password")}
      <Button disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? "New to StayNest? " : "Already have an account? "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="font-bold text-teal-700"
        >
          {mode === "login" ? "Create account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
