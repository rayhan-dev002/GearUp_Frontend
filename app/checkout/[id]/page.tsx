"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { getApiError } from "@/lib/get-api-error";
import { useAuth } from "@/providers/auth-provider";
import { RentalStatusBadge } from "@/components/rental/rental-status-badge";
import type {
  ApiResponse,
  CheckoutResponse,
  RentalOrder,
} from "@/types/api";

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [order, setOrder] = useState<RentalOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(`/checkout/${params.id}`)}`
      );
      return;
    }

    if (user.role !== "CUSTOMER") {
      toast.error("Only customers can access checkout.");
      router.replace("/");
      return;
    }

    async function getOrder() {
      try {
        const response = await api.get<ApiResponse<RentalOrder>>(
          `/rentals/${params.id}`
        );
        setOrder(response.data.data);
      } catch (error) {
        toast.error(getApiError(error, "Unable to load rental order"));
      } finally {
        setIsLoadingOrder(false);
      }
    }

    getOrder();
  }, [isAuthLoading, params.id, router, user]);

  async function handleStripeCheckout() {
    if (!order) return;

    try {
      setIsPaying(true);

      const response = await api.post<ApiResponse<CheckoutResponse>>(
        "/payments/checkout",
        {
          rentalOrderId: order.id,
          method: "STRIPE",
        }
      );

      window.location.assign(response.data.data.checkoutUrl);
    } catch (error) {
      toast.error(getApiError(error, "Could not start Stripe checkout"));
      setIsPaying(false);
    }
  }

  if (isLoadingOrder || isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Order not found</h1>
        <Link
          href="/dashboard/rentals"
          className="mt-5 inline-block font-semibold text-orange-600"
        >
          View my rentals
        </Link>
      </section>
    );
  }

  const hasCompletedPayment = order.payments.some(
    (payment) => payment.status === "COMPLETED"
  );

  const isCancelled = order.status === "CANCELLED";

  return (
    <section className="bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl gap-7 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                Checkout
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Review your rental
              </h1>
            </div>

            <RentalStatusBadge status={order.status} />
          </div>

          <div className="mt-7 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <h2 className="font-semibold text-slate-950">
                    {item.gearItem.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Quantity: {item.quantity} · ৳
                    {Number(item.pricePerDay).toLocaleString()} / day
                  </p>
                </div>

                <p className="font-bold text-slate-950">
                  ৳{Number(item.subtotal).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-500">Rental starts</p>
              <p className="mt-1 font-semibold text-slate-900">
                {new Date(order.startDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-slate-500">Rental ends</p>
              <p className="mt-1 font-semibold text-slate-900">
                {new Date(order.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Payment summary</h2>

          <div className="mt-5 flex justify-between border-b border-slate-200 pb-4">
            <span className="text-slate-600">Total payable</span>
            <span className="text-xl font-bold text-slate-950">
              ৳{Number(order.totalAmount).toLocaleString()}
            </span>
          </div>

          {hasCompletedPayment ? (
            <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="mb-2 size-5" />
              Your payment has been completed successfully.
            </div>
          ) : isCancelled ? (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              This rental order has been cancelled and cannot be paid.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStripeCheckout}
                disabled={isPaying}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPaying && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {isPaying ? "Redirecting to Stripe..." : "Pay securely with Stripe"}
              </button>

              <div className="mt-4 flex gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                Your card details are handled by Stripe. GearUp does not store
                your card information.
              </div>
            </>
          )}

          <Link
            href="/dashboard/rentals"
            className="mt-5 block text-center text-sm font-semibold text-slate-700 hover:text-orange-600"
          >
            View my rentals
          </Link>
        </aside>
      </div>
    </section>
  );
}
