import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/layout/auth-shell";
export default function Register() {
  return (
    <AuthShell
      eyebrow="Join StayNest"
      title="Create your account"
      description="One secure account for memorable stays and effortless property management."
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}
