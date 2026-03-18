import { LoginForm } from "@/features/auth/components/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-violet-50 px-4 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <LoginForm />
    </div>
  );
}
