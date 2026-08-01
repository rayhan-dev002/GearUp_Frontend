"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { useAuth } from "@/providers/auth-provider";
import { getApiError } from "@/lib/get-api-error";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const user = await login({ email, password });

      toast.success(`Welcome back, ${user.name}!`);

      const redirectPath = searchParams.get("redirect");

      if (redirectPath?.startsWith("/")) {
        router.replace(redirectPath);
        return;
      }

      if (user.role === "PROVIDER") {
        router.replace("/provider");
        return;
      }

      if (user.role === "ADMIN") {
        router.replace("/admin");
        return;
      }

      router.replace("/dashboard/rentals");
    } catch (error) {
      toast.error(getApiError(error, "Unable to log in"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Welcome back"
      description="Log in to manage rentals, payments, and your GearUp account."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerHref="/auth/register"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && (
            <LoaderCircle className="size-4 animate-spin" />
          )}

          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Want to rent out your own equipment?{" "}
        <Link
          href="/auth/register?role=PROVIDER"
          className="font-medium text-orange-600"
        >
          Join as a provider
        </Link>
      </p>
    </AuthFormShell>
  );
}
