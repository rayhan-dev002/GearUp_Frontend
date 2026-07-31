import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import type { Gear } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface GearCardProps {
  gear: Gear;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1000&q=80";

export function GearCard({ gear }: GearCardProps) {
  const imageUrl = gear.images?.[0] || fallbackImage;
  const isAvailable = gear.isActive && gear.availableStock > 0;

  const averageRating =
    gear.reviews && gear.reviews.length > 0
      ? gear.reviews.reduce((sum, review) => sum + review.rating, 0) / gear.reviews.length
      : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/gear/${gear.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={imageUrl}
            alt={gear.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
              isAvailable ? "bg-lime-300 text-slate-950" : "bg-slate-950/90 text-white"
            }`}
          >
            {isAvailable ? `${gear.availableStock} available` : "Unavailable"}
          </span>

          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 backdrop-blur">
            {gear.category?.name || "Outdoor"}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-lime-700">
              {gear.brand || "Premium gear"}
            </p>

            <Link
              href={`/gear/${gear.id}`}
              className="mt-1 block text-lg font-extrabold text-slate-950 transition hover:text-lime-700"
            >
              {gear.name}
            </Link>
          </div>

          <Link
            href={`/gear/${gear.id}`}
            aria-label={`View ${gear.name}`}
            className="rounded-lg bg-slate-100 p-2 text-slate-700 transition hover:bg-lime-300 hover:text-slate-950"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-4">
          <p className="text-xl font-black text-slate-950">
            {formatCurrency(gear.pricePerDay)}
            <span className="text-sm font-medium text-slate-500"> / day</span>
          </p>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {averageRating ? (
              <>
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-700">{averageRating.toFixed(1)}</span>
                <span>({gear.reviews?.length} reviews)</span>
              </>
            ) : (
              <>
                <MapPin className="size-3.5" />
                <span>{gear.provider?.businessName || gear.provider?.name || "GearUp provider"}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
