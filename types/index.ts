export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export type RentalStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Provider {
  id: string;
  name: string;
  businessName?: string | null;
  avatar?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Gear {
  id: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  pricePerDay: number | string;
  images: string[];
  totalStock: number;
  availableStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  provider: Provider;
  reviews?: Review[];
}

export interface GearListData {
  meta: PaginationMeta;
  data: Gear[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  address?: string | null;
  businessName?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RentalOrderItem {
  id: string;
  quantity: number;
  pricePerDay: number | string;
  subtotal: number | string;
  gearItemId: string;
  gearItem: Gear;
}

export interface RentalOrder {
  id: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  totalAmount: number | string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  items: RentalOrderItem[];
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number | string;
  method: "STRIPE" | "SSLCOMMERZ";
  status: PaymentStatus;
  rentalOrderId: string;
  gatewayReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface CheckoutSessionResponse {
  payment: Payment;
  checkoutUrl: string;
}

export interface PendingRental {
  gearItemId: string;
  gearName: string;
  quantity: number;
  startDate: string;
  endDate: string;
}
