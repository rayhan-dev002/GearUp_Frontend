"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, GearListData } from "@/types";
import { GearCard } from "./gear-card";

export function FeaturedGear() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-gear"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<GearListData>>("/gear?limit=4");
      return response.data.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="aspect-[4/3] animate-pulse bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-2/5 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
        <AlertCircle className="size-8 text-slate-400" />
        <h3 className="mt-3 text-lg font-bold text-slate-800">
          Featured gear is unavailable right now
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Start your backend server on port 5000 to load live gear listings.
        </p>
        <Link
          href="/gear"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
        >
          Browse all gear
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-lime-600" />
        <h3 className="mt-3 text-lg font-bold text-slate-800">New gear is coming soon</h3>
        <p className="mt-2 text-sm text-slate-500">
          Our providers are preparing equipment for your next adventure.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((gear) => (
        <GearCard key={gear.id} gear={gear} />
      ))}
    </div>
  );
}
