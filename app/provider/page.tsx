"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  LoaderCircle,
  PackagePlus,
  Pencil,
  Power,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { RolePageLoader } from "@/components/dashboard/role-page-loader";
import { GearFormModal } from "@/components/provider/gear-form-modal";
import { RentalStatusBadge } from "@/components/rental/rental-status-badge";
import { api } from "@/lib/api";
import { getApiError } from "@/lib/get-api-error";
import { useAuth } from "@/providers/auth-provider";
import type {
  ApiResponse,
  Category,
  GearItem,
  ProviderRentalOrder,
  RentalStatus,
} from "@/types/api";

type ProviderTab = "gear" | "orders";

const nextStatusOptions: Partial<Record<RentalStatus, RentalStatus[]>> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PAID", "CANCELLED"],
  PAID: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["RETURNED"],
};

const statusLabels: Record<RentalStatus, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirm order",
  PAID: "Mark as paid",
  PICKED_UP: "Mark as picked up",
  RETURNED: "Mark as returned",
  CANCELLED: "Cancel order",
};

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<ProviderTab>("gear");
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [orders, setOrders] = useState<ProviderRentalOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deactivatingGearId, setDeactivatingGearId] = useState<string | null>(
    null
  );

  const loadProviderData = useCallback(async () => {
    try {
      setIsLoadingData(true);

      const [gearResponse, ordersResponse, categoriesResponse] =
        await Promise.all([
          api.get<ApiResponse<GearItem[]>>("/provider/gear"),
          api.get<ApiResponse<ProviderRentalOrder[]>>("/provider/orders"),
          api.get<ApiResponse<Category[]>>("/categories"),
        ]);

      setGearItems(gearResponse.data.data);
      setOrders(ordersResponse.data.data);
      setCategories(categoriesResponse.data.data);
    } catch (error) {
      toast.error(getApiError(error, "Unable to load provider dashboard"));
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.replace("/auth/login?redirect=/provider");
      return;
    }

    if (user.role !== "PROVIDER") {
      toast.error("This dashboard is only available to providers.");
      router.replace("/");
      return;
    }

    loadProviderData();
  }, [isAuthLoading, loadProviderData, router, user]);

  const dashboardStats = useMemo(() => {
    const activeListings = gearItems.filter((item) => item.isActive).length;
    const activeOrders = orders.filter(
      (order) => !["RETURNED", "CANCELLED"].includes(order.status)
    ).length;

    const paidRevenue = orders
      .filter((order) => order.status === "PAID" || order.status === "RETURNED")
      .reduce((total, order) => total + Number(order.totalAmount), 0);

    return {
      activeListings,
      activeOrders,
      paidRevenue,
      totalGear: gearItems.length,
    };
  }, [gearItems, orders]);

  function openAddGearModal() {
    setSelectedGear(null);
    setIsGearModalOpen(true);
  }

  function openEditGearModal(gear: GearItem) {
    setSelectedGear(gear);
    setIsGearModalOpen(true);
  }

  async function handleDeactivateGear(gear: GearItem) {
    const confirmation = window.confirm(
      `"${gear.name}" will be hidden from the public catalog. Continue?`
    );

    if (!confirmation) return;

    try {
      setDeactivatingGearId(gear.id);

      await api.delete(`/provider/gear/${gear.id}`);

      toast.success("Gear listing deactivated.");
      await loadProviderData();
    } catch (error) {
      toast.error(getApiError(error, "Unable to deactivate gear"));
    } finally {
      setDeactivatingGearId(null);
    }
  }

  async function handleOrderStatusUpdate(
    orderId: string,
    status: RentalStatus
  ) {
    const confirmation = window.confirm(
      `Are you sure you want to change this order status to "${status.replace(
        "_",
        " "
      )}"?`
    );

    if (!confirmation) return;

    try {
      setUpdatingOrderId(orderId);

      await api.patch(`/provider/orders/${orderId}`, { status });

      toast.success("Order status updated.");
      await loadProviderData();
    } catch (error) {
      toast.error(getApiError(error, "Unable to update order status"));
    } finally {
      setUpdatingOrderId(null);
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
              Provider dashboard
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-2 text-slate-600">
              Manage your equipment listings and customer rental orders.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddGearModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <PackagePlus className="size-4" />
            Add new gear
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Box className="size-5" />}
            label="Total listings"
            value={dashboardStats.totalGear}
          />
          <StatCard
            icon={<PackagePlus className="size-5" />}
            label="Active listings"
            value={dashboardStats.activeListings}
          />
          <StatCard
            icon={<ClipboardList className="size-5" />}
            label="Active orders"
            value={dashboardStats.activeOrders}
          />
          <StatCard
            icon={<CircleDollarSign className="size-5" />}
            label="Paid order value"
            value={`৳${dashboardStats.paidRevenue.toLocaleString()}`}
          />
        </div>

        <div className="mt-8 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("gear")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              activeTab === "gear"
                ? "border-lime-600 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-950"
            }`}
          >
            My gear ({gearItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              activeTab === "orders"
                ? "border-lime-600 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-950"
            }`}
          >
            Rental orders ({orders.length})
          </button>

          <button
            type="button"
            onClick={loadProviderData}
            className="ml-auto mb-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>

        {activeTab === "gear" ? (
          <div className="mt-6">
            {gearItems.length === 0 ? (
              <EmptyState
                title="You have not listed any gear yet"
                description="Add your first equipment listing and start receiving rental orders."
                buttonLabel="Add your first gear"
                onClick={openAddGearModal}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {gearItems.map((gear) => (
                  <article
                    key={gear.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="aspect-[16/9] bg-slate-100">
                      {gear.images?.[0] ? (
                        <img
                          src={gear.images[0]}
                          alt={gear.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-sm font-semibold text-slate-400">
                          No image added
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-lime-700">
                            {gear.category?.name || "Uncategorized"}
                          </p>
                          <h2 className="mt-1 line-clamp-1 text-lg font-bold text-slate-950">
                            {gear.name}
                          </h2>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            gear.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {gear.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-slate-500">Daily price</p>
                          <p className="mt-1 font-bold text-slate-950">
                            ৳{Number(gear.pricePerDay).toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-slate-500">Available stock</p>
                          <p className="mt-1 font-bold text-slate-950">
                            {gear.availableStock} / {gear.totalStock}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() => openEditGearModal(gear)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil className="size-4" />
                          Edit
                        </button>

                        {gear.isActive && (
                          <button
                            type="button"
                            onClick={() => handleDeactivateGear(gear)}
                            disabled={deactivatingGearId === gear.id}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            {deactivatingGearId === gear.id ? (
                              <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                              <Power className="size-4" />
                            )}
                            Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {orders.length === 0 ? (
              <EmptyState
                title="No rental orders yet"
                description="Rental orders for your listed equipment will appear here."
              />
            ) : (
              orders.map((order) => {
                const availableActions = nextStatusOptions[order.status] || [];

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-slate-950">
                          {order.customer.name}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {order.customer.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <RentalStatusBadge status={order.status} />
                        <p className="font-bold text-slate-950">
                          ৳{Number(order.totalAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-4 text-sm"
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
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="size-4 text-lime-700" />
                        {new Date(order.startDate).toLocaleDateString()} —{" "}
                        {new Date(order.endDate).toLocaleDateString()}
                      </div>

                      {availableActions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {availableActions.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                handleOrderStatusUpdate(order.id, status)
                              }
                              disabled={updatingOrderId === order.id}
                              className={`rounded-lg px-3 py-2 text-sm font-bold transition disabled:opacity-60 ${
                                status === "CANCELLED"
                                  ? "border border-red-200 text-red-600 hover:bg-red-50"
                                  : "bg-slate-950 text-white hover:bg-slate-800"
                              }`}
                            >
                              {updatingOrderId === order.id
                                ? "Updating..."
                                : statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>

      <GearFormModal
        isOpen={isGearModalOpen}
        gear={selectedGear}
        categories={categories}
        onClose={() => setIsGearModalOpen(false)}
        onSuccess={loadProviderData}
      />
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
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

function EmptyState({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel?: string;
  onClick?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
      <Box className="mx-auto size-10 text-slate-400" />
      <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      {buttonLabel && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="mt-6 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
