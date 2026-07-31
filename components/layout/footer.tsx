import Link from "next/link";
import { Globe, Mail, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight text-white">
            Gear<span className="text-lime-400">Up</span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
            Rent the gear you need for every adventure, sport, and outdoor moment.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="#"
              aria-label="GearUp website"
              className="rounded-lg bg-slate-800 p-2 transition hover:bg-lime-400 hover:text-slate-950"
            >
              <Globe className="size-4" />
            </a>

            <a
              href="#"
              aria-label="GearUp social media"
              className="rounded-lg bg-slate-800 p-2 transition hover:bg-lime-400 hover:text-slate-950"
            >
              <Send className="size-4" />
            </a>

            <a
              href="mailto:hello@gearup.com"
              aria-label="Email GearUp"
              className="rounded-lg bg-slate-800 p-2 transition hover:bg-lime-400 hover:text-slate-950"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/gear" className="hover:text-lime-400">
              Browse gear
            </Link>
            <Link href="/#how-it-works" className="hover:text-lime-400">
              How it works
            </Link>
            <Link href="/auth/register" className="hover:text-lime-400">
              Join GearUp
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">For providers</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/auth/register?role=PROVIDER" className="hover:text-lime-400">
              List your gear
            </Link>
            <Link href="/dashboard/provider" className="hover:text-lime-400">
              Provider dashboard
            </Link>
            <a href="#provider-guide" className="hover:text-lime-400">
              Provider guide
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">Support</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a href="mailto:support@gearup.com" className="hover:text-lime-400">
              Help center
            </a>
            <a href="#safety" className="hover:text-lime-400">
              Safety & trust
            </a>
            <a href="#terms" className="hover:text-lime-400">
              Terms & privacy
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} GearUp. All rights reserved.</p>
          <p>Made for every kind of adventure.</p>
        </div>
      </div>
    </footer>
  );
}
