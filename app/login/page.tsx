import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/layout/auth-shell";
export default function Login() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to StayNest"
      description="Manage your trips, messages, saved homes, and property workspace."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
