import type { RentalStatus } from "@/types/api";

const statusStyles: Record<RentalStatus, string> = {
  PLACED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PAID: "bg-emerald-100 text-emerald-800",
  PICKED_UP: "bg-violet-100 text-violet-800",
  RETURNED: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-red-100 text-red-800",
};

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
