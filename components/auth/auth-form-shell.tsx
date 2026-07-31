import Link from "next/link";
import type { ReactNode } from "react";

interface AuthFormShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

export function AuthFormShell({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthFormShellProps) {
  return (
    <section className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/"
          className="mb-7 inline-block text-xl font-bold tracking-tight text-slate-950"
        >
          Gear<span className="text-orange-500">Up</span>
        </Link>

        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-7">{children}</div>

        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </section>
  );
}
