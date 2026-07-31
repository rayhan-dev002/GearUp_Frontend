"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/providers/auth-provider";

const navigationLinks = [
  { label: "Browse Gear", href: "/gear" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Providers", href: "/auth/register?role=PROVIDER" },
];

export function Navbar() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dashboardHref =
    user?.role === "CUSTOMER"
      ? "/dashboard/rentals"
      : user?.role === "PROVIDER"
        ? "/provider"
        : "/admin";

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await logout();

      toast.success("Logged out successfully");
      setMobileMenuOpen(false);
      router.push("/");
    } catch {
      toast.error("Could not log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-950"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-lime-400 text-slate-950">
            <ShoppingBag className="size-5" strokeWidth={2.8} />
          </span>
          Gear<span className="text-lime-600">Up</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigationLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/gear"
            aria-label="Search gear"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <Search className="size-5" />
          </Link>

          {!isLoading &&
            (user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <UserRound className="size-4" />
                  Sign in
                </Link>

                <Link
                  href="/gear"
                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Rent gear
                </Link>
              </>
            ))}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((previous) => !previous)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="size-6" />
          ) : (
            <Menu className="size-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigationLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}

            {!isLoading &&
              (user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="size-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    <UserRound className="size-4" />
                    Sign in
                  </Link>

                  <Link
                    href="/gear"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 rounded-xl bg-slate-950 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    Browse gear
                  </Link>
                </>
              ))}
          </nav>
        </div>
      )}
    </header>
  );
}
