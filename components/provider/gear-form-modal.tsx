"use client";

import { LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { getApiError } from "@/lib/get-api-error";
import type {
  ApiResponse,
  Category,
  CreateGearPayload,
  GearItem,
  UpdateGearPayload,
} from "@/types/api";

interface GearFormModalProps {
  isOpen: boolean;
  gear?: GearItem | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

interface GearFormState {
  name: string;
  description: string;
  brand: string;
  pricePerDay: string;
  totalStock: string;
  categoryId: string;
  imageUrls: string;
  isActive: boolean;
}

const initialForm: GearFormState = {
  name: "",
  description: "",
  brand: "",
  pricePerDay: "",
  totalStock: "1",
  categoryId: "",
  imageUrls: "",
  isActive: true,
};

export function GearFormModal({
  isOpen,
  gear,
  categories,
  onClose,
  onSuccess,
}: GearFormModalProps) {
  const [form, setForm] = useState<GearFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(gear);

  useEffect(() => {
    if (!isOpen) return;

    if (gear) {
      setForm({
        name: gear.name,
        description: gear.description || "",
        brand: gear.brand || "",
        pricePerDay: String(gear.pricePerDay),
        totalStock: String(gear.totalStock),
        categoryId: gear.categoryId,
        imageUrls: gear.images?.join(", ") || "",
        isActive: gear.isActive,
      });
    } else {
      setForm({
        ...initialForm,
        categoryId: categories[0]?.id || "",
      });
    }
  }, [categories, gear, isOpen]);

  if (!isOpen) return null;

  function updateField<K extends keyof GearFormState>(
    field: K,
    value: GearFormState[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const pricePerDay = Number(form.pricePerDay);
    const totalStock = Number(form.totalStock);

    if (!form.categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      toast.error("Price per day must be greater than 0.");
      return;
    }

    if (!Number.isInteger(totalStock) || totalStock < 1) {
      toast.error("Total stock must be at least 1.");
      return;
    }

    const images = form.imageUrls
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);

      if (isEditing && gear) {
        const payload: UpdateGearPayload = {
          name: form.name,
          description: form.description || undefined,
          brand: form.brand || undefined,
          pricePerDay,
          totalStock,
          categoryId: form.categoryId,
          images,
          isActive: form.isActive,
        };

        await api.patch<ApiResponse<GearItem>>(
          `/provider/gear/${gear.id}`,
          payload
        );

        toast.success("Gear listing updated successfully.");
      } else {
        const payload: CreateGearPayload = {
          name: form.name,
          description: form.description || undefined,
          brand: form.brand || undefined,
          pricePerDay,
          totalStock,
          categoryId: form.categoryId,
          images,
        };

        await api.post<ApiResponse<GearItem>>("/provider/gear", payload);

        toast.success("New gear listing added successfully.");
      }

      await onSuccess();
      onClose();
    } catch (error) {
      toast.error(getApiError(error, "Unable to save gear listing"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {isEditing ? "Edit gear listing" : "Add new gear"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add accurate information so customers can rent confidently.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Gear name
              </label>
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Example: Canon EOS R6 Mark II"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(event) => updateField("brand", event.target.value)}
                placeholder="Canon, Sony, DJI..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Category
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(event) =>
                  updateField("categoryId", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Price per day (৳)
              </label>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={form.pricePerDay}
                onChange={(event) =>
                  updateField("pricePerDay", event.target.value)
                }
                placeholder="2500"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Total stock
              </label>
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.totalStock}
                onChange={(event) =>
                  updateField("totalStock", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Image URLs
              </label>
              <input
                value={form.imageUrls}
                onChange={(event) =>
                  updateField("imageUrls", event.target.value)
                }
                placeholder="https://image-1.jpg, https://image-2.jpg"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Multiple image URLs comma দিয়ে আলাদা করুন।
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Tell customers about the gear condition, included accessories, specifications..."
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>

            {isEditing && (
              <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="size-4 accent-lime-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Keep this listing active
                  </span>
                  <span className="text-xs text-slate-500">
                    Inactive gear will no longer appear in the public catalog.
                  </span>
                </span>
              </label>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || categories.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add gear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
