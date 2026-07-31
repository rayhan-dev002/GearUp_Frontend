"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  Category,
  Gear,
  GearListData,
} from "@/types";
import { GearCard } from "./gear-card";

const DEFAULT_LIMIT = 8;

export function GearBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(DEFAULT_LIMIT));

    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (brand.trim()) params.set("brand", brand.trim());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    return params.toString();
  }, [search, category, brand, minPrice, maxPrice, page]);

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category[]>>("/categories");
      return response.data.data;
    },
  });

  const {
    data: gearResponse,
    isLoading: gearLoading,
    isError: gearError,
  } = useQuery({
    queryKey: ["gear", queryString],
    queryFn: async (): Promise<GearListData> => {
      const response = await apiClient.get<ApiResponse<GearListData | Gear[]>>(
        `/gear?${queryString}`,
      );

      const payload = response.data.data;

      /*
        Supports both possible backend response shapes:

        1. Normal paginated API response:
        {
          data: {
            meta: { page, limit, total },
            data: [...]
          }
        }

        2. Direct array response:
        {
          data: [...]
        }
      */
      if (Array.isArray(payload)) {
        return {
          data: payload,
          meta: {
            page,
            limit: DEFAULT_LIMIT,
            total: payload.length,
          },
        };
      }

      return {
        data: Array.isArray(payload?.data) ? payload.data : [],
        meta: {
          page: payload?.meta?.page ?? page,
          limit: payload?.meta?.limit ?? DEFAULT_LIMIT,
          total: payload?.meta?.total ?? 0,
        },
      };
    },
  });

  const visibleGear = availableOnly
    ? gearResponse?.data?.filter((gear) => gear.availableStock > 0) ?? []
    : gearResponse?.data ?? [];

  const totalPages = Math.max(
    1,
    Math.ceil((gearResponse?.meta?.total ?? 0) / DEFAULT_LIMIT),
  );

  function resetFilters() {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setAvailableOnly(false);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleFilterChange(callback: () => void) {
    callback();
    setPage(1);
  }

  const filterContent = (
    <div className="space-y-6">
      <div>
        <label htmlFor="gear-search" className="mb-2 block text-sm font-bold text-slate-800">
          Search gear
        </label>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            id="gear-search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Bike, tent, kayak..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="mb-2 block text-sm font-bold text-slate-800">
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={(event) => handleFilterChange(() => setCategory(event.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
        >
          <option value="">All categories</option>

          {categoriesLoading ? (
            <option disabled>Loading categories...</option>
          ) : (
            categories?.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label htmlFor="brand" className="mb-2 block text-sm font-bold text-slate-800">
          Brand
        </label>

        <input
          id="brand"
          value={brand}
          onChange={(event) => handleFilterChange(() => setBrand(event.target.value))}
          placeholder="e.g. Trek, Nike"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-slate-800">Price per day</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="min-price" className="sr-only">
              Minimum price
            </label>

            <input
              id="min-price"
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => handleFilterChange(() => setMinPrice(event.target.value))}
              placeholder="Min"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
            />
          </div>

          <div>
            <label htmlFor="max-price" className="sr-only">
              Maximum price
            </label>

            <input
              id="max-price"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => handleFilterChange(() => setMaxPrice(event.target.value))}
              placeholder="Max"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-100"
            />
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <span>
          <span className="block text-sm font-bold text-slate-800">Available now</span>
          <span className="block text-xs text-slate-500">Only show available gear</span>
        </span>

        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(event) => handleFilterChange(() => setAvailableOnly(event.target.checked))}
          className="size-4 accent-lime-600"
        />
      </label>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-lime-700">
            Explore the collection
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Find your next adventure
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Rent premium sports and outdoor equipment from trusted local providers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="mb-6 flex items-center gap-2">
            <Filter className="size-5 text-lime-700" />
            <h2 className="font-extrabold text-slate-950">Filters</h2>
          </div>

          {filterContent}
        </aside>

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {gearLoading ? (
                "Finding great gear..."
              ) : (
                <>
                  <span className="font-bold text-slate-950">
                    {gearResponse?.meta?.total ?? 0}
                  </span>{" "}
                  gear items found
                </>
              )}
            </p>

            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <SlidersHorizontal className="size-4" />
              Live filters
            </div>
          </div>

          {gearLoading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[4/3] animate-pulse bg-slate-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {gearError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <h2 className="text-lg font-bold text-red-900">Could not load gear listings</h2>
              <p className="mt-2 text-sm text-red-700">
                Please make sure your backend server is running on port 5000.
              </p>
            </div>
          )}

          {!gearLoading && !gearError && visibleGear.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Search className="mx-auto size-9 text-slate-400" />

              <h2 className="mt-4 text-xl font-black text-slate-900">No gear found</h2>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search keyword or clearing your filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
              >
                Clear filters
              </button>
            </div>
          )}

          {!gearLoading && !gearError && visibleGear.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleGear.map((gear) => (
                  <GearCard key={gear.id} gear={gear} />
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>

                <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 p-4 lg:hidden">
          <div className="ml-auto flex h-full w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <Filter className="size-5 text-lime-700" />
                <h2 className="font-extrabold text-slate-950">Filters</h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">{filterContent}</div>

            <div className="border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
