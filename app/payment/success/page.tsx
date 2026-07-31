"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <section className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" />

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Payment submitted successfully
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Stripe is confirming your payment. Your rental status will update
          automatically after the secure webhook is received by the backend.
        </p>

        <Link
          href="/dashboard/rentals"
          className="mt-7 inline-flex rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          View my rentals
        </Link>
      </div>
    </section>
  );
}
