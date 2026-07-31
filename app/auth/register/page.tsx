"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { useAuth } from "@/providers/auth-provider";
import { getApiError } from "@/lib/get-api-error";
import type { RegisterPayload } from "@/types/api";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const defaultRole =
    searchParams.get("role") === "PROVIDER" ? "PROVIDER" : "CUSTOMER";

  const [form, setForm] = useState<RegisterPayload>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    businessName: "",
    role: defaultRole,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof RegisterPayload>(
    field: K,
    value: RegisterPayload[K]
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      await register({
        ...form,
        businessName:
          form.role === "PROVIDER" ? form.businessName || undefined : undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });

      toast.success("Account created successfully. Please log in.");
      router.push("/auth/login");
    } catch (error) {
      toast.error(getApiError(error, "Unable to create account"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Create your GearUp account"
      description="Create a customer account to rent gear, or join as a provider to list equipment."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerHref="/auth/login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800">
            I want to
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField("role", "CUSTOMER")}
              className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                form.role === "CUSTOMER"
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"
              }`}
            >
              Rent equipment
            </button>

            <button
              type="button"
              onClick={() => updateField("role", "PROVIDER")}
              className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                form.role === "PROVIDER"
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"
              }`}
            >
              List my gear
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Full name
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Your full name"
          />
        </div>

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
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Phone <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="+880..."
          />
        </div>

        {form.role === "PROVIDER" && (
          <div>
            <label
              htmlFor="businessName"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Business name <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="businessName"
              value={form.businessName}
              onChange={(event) =>
                updateField("businessName", event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Your rental business name"
            />
          </div>
        )}

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
            minLength={6}
            required
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            placeholder="Minimum 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthFormShell>
  );
}
