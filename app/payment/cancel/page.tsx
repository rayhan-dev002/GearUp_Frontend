"use client";

import Link from "next/link";
import { CircleX } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <section className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CircleX className="mx-auto size-14 text-red-500" />

        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Payment was cancelled
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          No payment has been completed. You can return to your rental order
          and try checkout again whenever you are ready.
        </p>

        <Link
          href="/dashboard/rentals"
          className="mt-7 inline-flex rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Return to my rentals
        </Link>
      </div>
    </section>
  );
}
