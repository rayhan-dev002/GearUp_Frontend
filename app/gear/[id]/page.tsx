"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApiResponse, Gear } from "@/types";
import { RentalPanel } from "@/components/gear/rental-panel";

const fallbackImage =
  "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80";

export default function GearDetailsPage() {
  const params = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    data: gear,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["gear-details", params.id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Gear>>(`/gear/${params.id}`);
      return response.data.data;
    },
    enabled: Boolean(params.id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-24 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-[480px] animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (isError || !gear) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-black text-slate-950">Gear not found</h1>
        <p className="mt-3 text-slate-600">
          This gear may have been removed or is no longer available.
        </p>
        <Link
          href="/gear"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft className="size-4" />
          Back to gear
        </Link>
      </div>
    );
  }

  const images = gear.images?.length ? gear.images : [fallbackImage];
  const currentImage = images[selectedImage] || fallbackImage;

  const averageRating =
    gear.reviews && gear.reviews.length > 0
      ? gear.reviews.reduce((total, review) => total + review.rating, 0) / gear.reviews.length
      : 0;

  function previousImage() {
    setSelectedImage((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function nextImage() {
    setSelectedImage((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/gear"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="size-4" />
        Back to all gear
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={currentImage}
              alt={gear.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-800 shadow-lg backdrop-blur transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-800 shadow-lg backdrop-blur transition hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            <span className="absolute left-4 top-4 rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-slate-950">
              {gear.category?.name || "Outdoor gear"}
            </span>
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === index
                      ? "border-lime-500"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${gear.name} image ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 border-b border-slate-200 pb-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-lime-700">
              {gear.brand || "Premium rental gear"}
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {gear.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              {averageRating > 0 ? (
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <strong className="text-slate-900">{averageRating.toFixed(1)}</strong>
                  <span>({gear.reviews?.length} reviews)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 text-slate-400" />
                  No reviews yet
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <PackageCheck className="size-4 text-slate-500" />
                {gear.availableStock} of {gear.totalStock} units available
              </span>
            </div>
          </div>

          <section className="py-8">
            <h2 className="text-2xl font-black text-slate-950">About this gear</h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
              {gear.description || "No additional description has been provided for this item."}
            </p>
          </section>

          <section className="border-t border-slate-200 py-8">
            <h2 className="text-2xl font-black text-slate-950">Why rent with GearUp?</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-5">
                <ShieldCheck className="size-6 text-lime-700" />
                <h3 className="mt-4 font-black text-slate-950">Secure checkout</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Protected Stripe payments and clear rental records.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <CheckCircle2 className="size-6 text-lime-700" />
                <h3 className="mt-4 font-black text-slate-950">Quality equipment</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Gear is listed and managed by verified rental providers.
                </p>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200 py-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-950">Reviews</h2>
              <span className="text-sm font-semibold text-slate-500">
                {gear.reviews?.length || 0} total
              </span>
            </div>

            {!gear.reviews || gear.reviews.length === 0 ? (
              <div className="mt-5 rounded-2xl bg-slate-100 p-6">
                <p className="font-bold text-slate-800">No reviews yet</p>
                <p className="mt-1 text-sm text-slate-600">
                  Rent and return this gear to be the first to share your experience.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {gear.reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <CircleUserRound className="size-5 text-slate-400" />
                        <span className="font-bold text-slate-800">Verified renter</span>
                      </div>

                      <span className="flex items-center gap-1 text-sm font-bold text-slate-800">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {review.rating}.0
                      </span>
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                    )}

                    <p className="mt-3 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:sticky lg:top-24">
          <RentalPanel gear={gear} />

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Provided by
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-lime-200 font-black text-lime-900">
                {gear.provider?.name?.charAt(0).toUpperCase() || "G"}
              </div>

              <div>
                <p className="font-black text-slate-950">
                  {gear.provider?.businessName || gear.provider?.name || "GearUp Provider"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="size-3.5" />
                  Local rental partner
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">
          Listed on {formatDate(gear.createdAt)} · {formatCurrency(gear.pricePerDay)} per day
        </p>
      </div>
    </div>
  );
}
