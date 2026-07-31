"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { getApiError } from "@/lib/get-api-error";
import { useAuth } from "@/providers/auth-provider";
import type { ApiResponse, RentalOrder } from "@/types/api";



interface RentalPanelProps {
  gear: {
    id: string;
    name: string;
    pricePerDay: number | string;
    availableStock: number;
  };
}

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

export function RentalPanel({ gear }: RentalPanelProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [startDate, setStartDate] = useState(toDateInputValue(today));
  const [endDate, setEndDate] = useState(toDateInputValue(tomorrow));
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rentalDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference = end.getTime() - start.getTime();
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return Number.isFinite(days) && days > 0 ? days : 0;
  }, [startDate, endDate]);

  const total = useMemo(() => {
    return Number(gear.pricePerDay) * rentalDays * quantity;
  }, [gear.pricePerDay, quantity, rentalDays]);

  async function handleContinueToCheckout() {
    if (!user) {
      const redirect = `/gear/${gear.id}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (user.role !== "CUSTOMER") {
      toast.error("Only customer accounts can place rental orders.");
      return;
    }

    if (!startDate || !endDate || rentalDays < 1) {
      toast.error("Please select a valid rental date range.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post<ApiResponse<RentalOrder>>("/rentals", {
        items: [
          {
            gearItemId: gear.id,
            quantity,
          },
        ],
        startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
        endDate: new Date(`${endDate}T00:00:00.000Z`).toISOString(),
      });

      toast.success("Rental order created.");
      router.push(`/checkout/${response.data.data.id}`);
    } catch (error) {
      toast.error(getApiError(error, "Could not create rental order"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isOutOfStock = gear.availableStock < 1;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Rental price</p>
          <p className="text-2xl font-bold text-slate-950">
            ৳{Number(gear.pricePerDay).toLocaleString()}
            <span className="text-sm font-normal text-slate-500"> / day</span>
          </p>
        </div>

        <p
          className={`text-sm font-medium ${
            isOutOfStock ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {isOutOfStock
            ? "Out of stock"
            : `${gear.availableStock} available`}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Start date
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <input
              type="date"
              min={toDateInputValue(today)}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            End date
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Quantity
        </label>
        <select
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          {Array.from(
            { length: Math.min(gear.availableStock, 10) },
            (_, index) => index + 1
          ).map((amount) => (
            <option key={amount} value={amount}>
              {amount} item{amount > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Rental duration</span>
          <span>{rentalDays || 0} day(s)</span>
        </div>

        <div className="flex justify-between text-base font-bold text-slate-950">
          <span>Total estimate</span>
          <span>৳{total.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinueToCheckout}
        disabled={
          isSubmitting ||
          isAuthLoading ||
          isOutOfStock ||
          rentalDays < 1 ||
          quantity < 1
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
        {isSubmitting
          ? "Creating order..."
          : user
            ? "Continue to checkout"
            : "Log in to rent"}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-slate-500">
        Payment is securely processed through Stripe.
      </p>
    </aside>
  );
}
