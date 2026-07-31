import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Mountain,
  ShieldCheck,
  Snowflake,
  TentTree,
  Waves,
} from "lucide-react";
import { FeaturedGear } from "@/components/gear/featured-gear";

const categories = [
  {
    name: "Cycling",
    description: "Bikes, helmets & accessories",
    icon: Bike,
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Camping",
    description: "Tents, packs & camp essentials",
    icon: TentTree,
    image:
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Water Sports",
    description: "Boards, kayaks & wetsuits",
    icon: Waves,
    image:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fitness",
    description: "Training gear for every goal",
    icon: Dumbbell,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
  },
];

const steps = [
  {
    number: "01",
    title: "Find your gear",
    description: "Search quality sports and outdoor equipment near you.",
    icon: Mountain,
  },
  {
    number: "02",
    title: "Choose your dates",
    description: "Select your rental period and review transparent pricing.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Get out there",
    description: "Pay securely, pick up your gear, and start your adventure.",
    icon: CheckCircle2,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85"
            alt="Mountain landscape"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/25" />
        </div>

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-4 py-2 text-sm font-bold text-lime-300">
              <span className="size-2 rounded-full bg-lime-300" />
              Your next adventure starts here
            </div>

            <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Rent more.
              <br />
              <span className="text-lime-300">Explore further.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Premium sports and outdoor gear, ready when you are. Skip the cost of
              ownership and spend more time doing what you love.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/gear"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3.5 text-sm font-extrabold text-slate-950 transition hover:bg-lime-200"
              >
                Explore gear
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/auth/register?role=PROVIDER"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20"
              >
                List your equipment
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-lime-300" />
                Secure payments
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-lime-300" />
                Quality checked gear
              </span>
            </div>
          </div>

          <div className="hidden justify-self-end lg:block">
            <div className="w-72 rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-bold text-lime-300">Adventure ready</p>
              <p className="mt-2 text-3xl font-black">One platform.</p>
              <p className="text-3xl font-black">Every season.</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <Bike className="size-5 text-lime-300" />
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <Snowflake className="size-5 text-lime-300" />
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <TentTree className="size-5 text-lime-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-lime-700">
              Explore by activity
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Gear for every kind of day out
            </h2>
          </div>

          <Link
            href="/gear"
            className="inline-flex items-center gap-1 text-sm font-extrabold text-slate-800 hover:text-lime-700"
          >
            View all categories
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={`/gear?category=${encodeURIComponent(category.name)}`}
                className="group relative min-h-64 overflow-hidden rounded-2xl bg-slate-900"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-70 transition duration-500 group-hover:scale-110 group-hover:opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="inline-flex rounded-lg bg-lime-300 p-2 text-slate-950">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3 text-xl font-black">{category.name}</h3>
                  <p className="mt-1 text-sm text-slate-200">{category.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-lime-700">
                Popular right now
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Ready for your next plan
              </h2>
            </div>

            <Link
              href="/gear"
              className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 sm:self-auto"
            >
              Browse all gear
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-9">
            <FeaturedGear />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-lime-300 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-lime-900">
              Simple by design
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              More adventure. Less gear clutter.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="rounded-2xl bg-lime-100/70 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-lime-800">{step.number}</span>
                    <span className="rounded-xl bg-slate-950 p-3 text-lime-300">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-black text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
