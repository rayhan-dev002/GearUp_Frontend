"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiResponse, CheckoutSessionResponse, RentalOrder } from "@/types";

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const {
    data: rentalOrder,
    isLoading: rentalLoading,
    isError,
  } = useQuery({
    queryKey: ["rental-order", params.id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RentalOrder>>(`/rentals/${params.id}`);
      return response.data.data;
    },
    enabled: Boolean(params.id) && Boolean(user),
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<CheckoutSessionResponse>>(
        "/payments/checkout",
        {
          rentalOrderId: params.id,
          method: "STRIPE",
        },
      );

      return response.data.data;
    },

    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create Stripe checkout session.";

      toast.error(message);
    },
  });

  if (!isLoading && !user) {
    router.replace(`/auth/login?redirect=/dashboard/customer/orders/${params.id}/pay`);
  }

  if (isLoading || rentalLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-lime-600" />
      </div>
    );
  }

  if (isError || !rentalOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black text-slate-950">Order not found</h1>
        <p className="mt-3 text-slate-600">
          We could not retrieve this rental order.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/customer")}
          className="mt-6 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  const isAlreadyPaid = rentalOrder.status === "PAID";
  const isPlaced = rentalOrder.status === "PLACED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-wider text-lime-700">
          Secure payment
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Complete your rental payment
        </h1>

        <div className="mt-7 rounded-2xl bg-slate-100 p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-600">Order status</span>
            <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-black text-amber-900">
              {rentalOrder.status}
            </span>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">
              Rental dates:{" "}
              <strong className="text-slate-900">
                {formatDate(rentalOrder.startDate)} – {formatDate(rentalOrder.endDate)}
              </strong>
            </p>

            <p className="mt-2 text-xl font-black text-slate-950">
              Total: {formatCurrency(rentalOrder.totalAmount)}
            </p>
          </div>
        </div>

        {isPlaced && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Your rental request is waiting for provider confirmation. Once confirmed,
            you can continue with Stripe payment.
          </div>
        )}

        {isAlreadyPaid && (
          <div className="mt-5 flex gap-3 rounded-xl border border-lime-200 bg-lime-50 p-4 text-sm text-lime-900">
            <CheckCircle2 className="size-5 shrink-0" />
            This order has already been paid successfully.
          </div>
        )}

        <button
          type="button"
          disabled={checkoutMutation.isPending || isAlreadyPaid || isPlaced}
          onClick={() => checkoutMutation.mutate()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkoutMutation.isPending ? (
            "Redirecting to Stripe..."
          ) : (
            <>
              <CreditCard className="size-4" />
              Pay with Stripe
            </>
          )}
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="size-4 text-lime-600" />
          Your payment is securely processed by Stripe.
        </div>
      </div>
    </div>
  );
}
