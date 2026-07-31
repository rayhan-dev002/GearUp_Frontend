export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export type RentalStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";

export type PaymentMethod = "STRIPE" | "SSLCOMMERZ";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  businessName?: string | null;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  businessName?: string;
  role: "CUSTOMER" | "PROVIDER";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RentalItemPayload {
  gearItemId: string;
  quantity: number;
}

export interface CreateRentalPayload {
  items: RentalItemPayload[];
  startDate: string;
  endDate: string;
}

export interface RentalGearItem {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  pricePerDay: number | string;
}

export interface RentalOrderItem {
  id: string;
  quantity: number;
  pricePerDay: number | string;
  subtotal: number | string;
  gearItem: RentalGearItem;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number | string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface RentalOrder {
  id: string;
  customerId: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  totalAmount: number | string;
  createdAt: string;
  updatedAt: string;
  items: RentalOrderItem[];
  payments: Payment[];
}

export interface CheckoutResponse {
  payment: Payment;
  checkoutUrl: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GearItem {
  id: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  pricePerDay: number | string;
  images: string[];
  totalStock: number;
  availableStock: number;
  isActive: boolean;
  categoryId: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  provider?: Pick<User, "id" | "name" | "email" | "businessName">;
}

export interface CreateGearPayload {
  name: string;
  description?: string;
  brand?: string;
  pricePerDay: number;
  images?: string[];
  totalStock: number;
  categoryId: string;
}

export interface UpdateGearPayload {
  name?: string;
  description?: string;
  brand?: string;
  pricePerDay?: number;
  images?: string[];
  totalStock?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProviderRentalOrder extends RentalOrder {
  customer: Pick<User, "id" | "name" | "email">;
}

export interface AdminRentalOrder extends RentalOrder {
  customer: Pick<User, "id" | "name" | "email">;
}


