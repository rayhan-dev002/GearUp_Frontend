"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { RolePageLoader } from "@/components/dashboard/role-page-loader";
import { RentalStatusBadge } from "@/components/rental/rental-status-badge";
import { api } from "@/lib/api";
import { getApiError } from "@/lib/get-api-error";
import { useAuth } from "@/providers/auth-provider";
import type {
  AdminRentalOrder,
  ApiResponse,
  GearItem,
  RentalStatus,
  User,
  UserStatus,
} from "@/types/api";

type AdminTab = "users" | "gear" | "rentals";

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

const nextStatusOptions: Partial<Record<RentalStatus, RentalStatus[]>> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PAID", "CANCELLED"],
  PAID: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["RETURNED"],
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [rentals, setRentals] = useState<AdminRentalOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updatingRentalId, setUpdatingRentalId] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    try {
      setIsLoadingData(true);

      const [usersResponse, gearResponse, rentalsResponse] = await Promise.all([
        api.get<PaginatedResponse<User>>("/admin/users?limit=100"),
        api.get<PaginatedResponse<GearItem>>("/admin/gear?limit=100"),
        api.get<PaginatedResponse<AdminRentalOrder>>(
          "/admin/rentals?limit=100"
        ),
      ]);

      setUsers(usersResponse.data.data);
      setGearItems(gearResponse.data.data);
      setRentals(rentalsResponse.data.data);
    } catch (error) {
      toast.error(getApiError(error, "Unable to load admin dashboard"));
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.replace("/auth/login?redirect=/admin");
      return;
    }

    if (user.role !== "ADMIN") {
      toast.error("This dashboard is only available to administrators.");
      router.replace("/");
      return;
    }

    loadAdminData();
  }, [isAuthLoading, loadAdminData, router, user]);

  const stats = useMemo(() => {
    return {
      users: users.length,
      providers: users.filter((item) => item.role === "PROVIDER").length,
      gear: gearItems.length,
      activeRentals: rentals.filter(
        (item) => !["RETURNED", "CANCELLED"].includes(item.status)
      ).length,
    };
  }, [gearItems, rentals, users]);

  async function handleUserStatusUpdate(
    targetUser: User,
    status: UserStatus
  ) {
    const action = status === "SUSPENDED" ? "suspend" : "activate";

    const confirmation = window.confirm(
      `Are you sure you want to ${action} ${targetUser.name}'s account?`
    );

    if (!confirmation) return;

    try {
      setUpdatingUserId(targetUser.id);

      await api.patch(`/admin/users/${targetUser.id}`, { status });

      toast.success(`User account ${action}d successfully.`);
      await loadAdminData();
    } catch (error) {
      toast.error(getApiError(error, "Unable to update user status"));
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleRentalStatusUpdate(
    rentalId: string,
    status: RentalStatus
  ) {
    const confirmation = window.confirm(
      `Change rental status to "${status.replace("_", " ")}"?`
    );

    if (!confirmation) return;

    try {
      setUpdatingRentalId(rentalId);

      // Backend rental route allows ADMIN to update rental status.
      await api.patch(`/rentals/${rentalId}/status`, { status });

      toast.success("Rental status updated.");
      await loadAdminData();
    } catch (error) {
      toast.error(getApiError(error, "Unable to update rental status"));
    } finally {
      setUpdatingRentalId(null);
    }
  }

  if (isAuthLoading || isLoadingData) {
    return <RolePageLoader />;
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-lime-700">
              Administration
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              GearUp admin dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Monitor users, equipment listings, and rental activity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAdminData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw className="size-4" />
            Refresh data
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            icon={<Users className="size-5" />}
            label="Total users"
            value={stats.users}
          />
          <AdminStatCard
            icon={<ShieldCheck className="size-5" />}
            label="Providers"
            value={stats.providers}
          />
          <AdminStatCard
            icon={<Boxes className="size-5" />}
            label="Gear listings"
            value={stats.gear}
          />
          <AdminStatCard
            icon={<ClipboardList className="size-5" />}
            label="Active rentals"
            value={stats.activeRentals}
          />
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200">
          <AdminTabButton
            label={`Users (${users.length})`}
            isActive={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <AdminTabButton
            label={`Gear (${gearItems.length})`}
            isActive={activeTab === "gear"}
            onClick={() => setActiveTab("gear")}
          />
          <AdminTabButton
            label={`Rentals (${rentals.length})`}
            isActive={activeTab === "rentals"}
            onClick={() => setActiveTab("rentals")}
          />
        </div>

        {activeTab === "users" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">User</th>
                    <th className="px-5 py-4 font-bold">Role</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold">Joined</th>
                    <th className="px-5 py-4 text-right font-bold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {users.map((account) => (
                    <tr key={account.id}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">{account.name}</p>
                        <p className="mt-0.5 text-slate-500">{account.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <RoleBadge role={account.role} />
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            account.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {account.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {account.createdAt
                          ? new Date(account.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {account.role !== "ADMIN" && account.id !== user?.id ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleUserStatusUpdate(
                                account,
                                account.status === "ACTIVE"
                                  ? "SUSPENDED"
                                  : "ACTIVE"
                              )
                            }
                            disabled={updatingUserId === account.id}
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-60 ${
                              account.status === "ACTIVE"
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {updatingUserId === account.id
                              ? "Updating..."
                              : account.status === "ACTIVE"
                                ? "Suspend"
                                : "Activate"}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "gear" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold">Gear</th>
                    <th className="px-5 py-4 font-bold">Provider</th>
                    <th className="px-5 py-4 font-bold">Category</th>
                    <th className="px-5 py-4 font-bold">Price/day</th>
                    <th className="px-5 py-4 font-bold">Stock</th>
                    <th className="px-5 py-4 font-bold">Visibility</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {gearItems.map((gear) => (
                    <tr key={gear.id}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">{gear.name}</p>
                        <p className="mt-0.5 text-slate-500">
                          {gear.brand || "No brand provided"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {gear.provider?.name || "—"}
                        </p>
                        <p className="text-slate-500">
                          {gear.provider?.email || ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {gear.category?.name || "—"}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-950">
                        ৳{Number(gear.pricePerDay).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {gear.availableStock} / {gear.totalStock}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            gear.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {gear.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "rentals" && (
          <div className="mt-6 space-y-5">
            {rentals.map((rental) => {
              const actions = nextStatusOptions[rental.status] || [];

              return (
                <article
                  key={rental.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Rental #{rental.id.slice(0, 8).toUpperCase()}
                      </p>
                      <h2 className="mt-1 font-bold text-slate-950">
                        {rental.customer.name}
                      </h2>
                      <p className="text-sm text-slate-600">
                        {rental.customer.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <RentalStatusBadge status={rental.status} />
                      <p className="text-lg font-black text-slate-950">
                        ৳{Number(rental.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    {rental.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 py-1.5 text-sm"
                      >
                        <span className="font-medium text-slate-800">
                          {item.gearItem.name} × {item.quantity}
                        </span>
                        <span className="text-slate-600">
                          ৳{Number(item.subtotal).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
                    <p className="text-sm text-slate-600">
                      {new Date(rental.startDate).toLocaleDateString()} —{" "}
                      {new Date(rental.endDate).toLocaleDateString()}
                    </p>

                    {actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {actions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              handleRentalStatusUpdate(rental.id, status)
                            }
                            disabled={updatingRentalId === rental.id}
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-60 ${
                              status === "CANCELLED"
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "bg-slate-950 text-white hover:bg-slate-800"
                            }`}
                          >
                            {updatingRentalId === rental.id
                              ? "Updating..."
                              : status.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function AdminStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function AdminTabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${
        isActive
          ? "border-lime-600 text-slate-950"
          : "border-transparent text-slate-500 hover:text-slate-950"
      }`}
    >
      {label}
    </button>
  );
}

function RoleBadge({ role }: { role: User["role"] }) {
  const colors = {
    CUSTOMER: "bg-blue-100 text-blue-700",
    PROVIDER: "bg-violet-100 text-violet-700",
    ADMIN: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${colors[role]}`}>
      {role}
    </span>
  );
}
