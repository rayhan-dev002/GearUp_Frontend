"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, LoaderCircle, PackageOpen } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { getApiError } from "@/lib/get-api-error";
import { useAuth } from "@/providers/auth-provider";
import { RentalStatusBadge } from "@/components/rental/rental-status-badge";
import type { ApiResponse, RentalOrder } from "@/types/api";

export default function MyRentalsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [rentals, setRentals] = useState<RentalOrder[]>([]);
  const [isLoadingRentals, setIsLoadingRentals] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  async function loadRentals() {
    try {
      setIsLoadingRentals(true);

      const response = await api.get<ApiResponse<RentalOrder[]>>("/rentals");
      setRentals(response.data.data);
    } catch (error) {
      toast.error(getApiError(error, "Unable to load rental orders"));
    } finally {
      setIsLoadingRentals(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.replace("/auth/login?redirect=/dashboard/rentals");
      return;
    }

    if (user.role !== "CUSTOMER") {
      router.replace("/");
      return;
    }

    loadRentals();
  }, [isAuthLoading, router, user]);

  async function handleCancel(orderId: string) {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this rental order?"
    );

    if (!shouldCancel) return;

    try {
      setCancellingOrderId(orderId);

      await api.patch(`/rentals/${orderId}/cancel`);

      toast.success("Rental order cancelled.");
      await loadRentals();
    } catch (error) {
      toast.error(getApiError(error, "Unable to cancel rental order"));
    } finally {
      setCancellingOrderId(null);
    }
  }

  if (isAuthLoading || isLoadingRentals) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <section className="bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Customer dashboard
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              My rentals
            </h1>
            <p className="mt-2 text-slate-600">
              Track your rental status, payments, and upcoming dates.
            </p>
          </div>

          <Link
            href="/gear"
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Browse gear
          </Link>
        </div>

        {rentals.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <PackageOpen className="mx-auto size-10 text-slate-400" />
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              No rental orders yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Browse available equipment and create your first rental.
            </p>
            <Link
              href="/gear"
              className="mt-5 inline-block font-semibold text-orange-600 hover:text-orange-700"
            >
              Explore gear →
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {rentals.map((rental) => {
              const isPaid = rental.payments.some(
                (payment) => payment.status === "COMPLETED"
              );

              const canCancel =
                rental.status === "PLACED" || rental.status === "CONFIRMED";

              return (
                <article
                  key={rental.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Order #{rental.id.slice(0, 8).toUpperCase()}
                      </p>
                      <div className="mt-2">
                        <RentalStatusBadge status={rental.status} />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-500">Total amount</p>
                      <p className="text-xl font-bold text-slate-950">
                        ৳{Number(rental.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {rental.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.gearItem.name}
                          </p>
                          <p className="text-slate-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <p className="font-medium text-slate-800">
                          ৳{Number(item.subtotal).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="size-4 text-orange-500" />
                      <span>
                        {new Date(rental.startDate).toLocaleDateString()} —{" "}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {!isPaid && rental.status !== "CANCELLED" && (
                        <Link
                          href={`/checkout/${rental.id}`}
                          className="rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                        >
                          Complete payment
                        </Link>
                      )}

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancel(rental.id)}
                          disabled={cancellingOrderId === rental.id}
                          className="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          {cancellingOrderId === rental.id
                            ? "Cancelling..."
                            : "Cancel order"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
