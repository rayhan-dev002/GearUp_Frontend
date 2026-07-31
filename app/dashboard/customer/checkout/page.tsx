"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, LoaderCircle, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { formatDate } from "@/lib/utils";
import type { ApiResponse, PendingRental, RentalOrder } from "@/types";

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [pendingRental, setPendingRental] = useState<PendingRental | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const storedRental = localStorage.getItem("gearup_pending_rental");

    if (storedRental) {
      try {
        setPendingRental(JSON.parse(storedRental));
      } catch {
        localStorage.removeItem("gearup_pending_rental");
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login?redirect=/dashboard/customer/checkout");
    }

    if (!isLoading && user && user.role !== "CUSTOMER") {
      toast.error("Only customer accounts can place rental orders.");
      router.replace("/");
    }
  }, [user, isLoading, router]);

  async function createRentalOrder() {
    if (!pendingRental) {
      toast.error("No pending rental was found.");
      return;
    }

    try {
      setCreatingOrder(true);

      const response = await apiClient.post<ApiResponse<RentalOrder>>("/rentals", {
        items: [
          {
            gearItemId: pendingRental.gearItemId,
            quantity: pendingRental.quantity,
          },
        ],
        startDate: pendingRental.startDate,
        endDate: pendingRental.endDate,
      });

      localStorage.removeItem("gearup_pending_rental");

      toast.success("Rental order created successfully.");

      router.push(`/dashboard/customer/orders/${response.data.data.id}/pay`);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create your rental order. Please try again.";

      toast.error(message);
    } finally {
      setCreatingOrder(false);
    }
  }

  if (isLoading || !pendingRental) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-lime-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/gear/${pendingRental.gearItemId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
      >
        <ChevronLeft className="size-4" />
        Back to gear details
      </Link>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-wider text-lime-700">
          Checkout
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">Review your rental</h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Confirm your rental details. You will be able to securely pay after the
          provider confirms your order.
        </p>

        <div className="mt-8 rounded-2xl bg-slate-100 p-5">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-lime-300 p-3 text-slate-950">
              <PackageCheck className="size-5" />
            </span>

            <div>
              <p className="font-black text-slate-950">{pendingRental.gearName}</p>
              <p className="mt-1 text-sm text-slate-600">
                Quantity: {pendingRental.quantity}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-lime-700" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pickup
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatDate(pendingRental.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-lime-700" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Return
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatDate(pendingRental.endDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={createRentalOrder}
          disabled={creatingOrder}
          className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creatingOrder ? "Creating rental order..." : "Confirm rental request"}
        </button>
      </div>
    </div>
  );
}
