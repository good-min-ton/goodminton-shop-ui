/**
 * API types — mirror backend response shapes.
 * Reference: docs/api-docs.md
 */

// ============================================================
// Envelope
// ============================================================

export interface ApiResponse<T> {
  code: number;
  result: T;
  message?: string;
}

export interface ApiError {
  code: number;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number; // 1-based
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ============================================================
// Auth & Account
// ============================================================

export type Role = "CUSTOMER" | "STORE_ADMIN" | "SUPER_ADMIN";
export type AccountStatus = "ACTIVE" | "INACTIVE";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Account {
  accountId: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
}

// ============================================================
// Catalog
// ============================================================

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Color {
  colorId: number;
  name: string;
  hexCode?: string; // not in API but useful client-side; leave optional
}

export type SizeType = "RACKET" | "NON_RACKET";

export interface SizeOption {
  sizeId: number;
  name: string;
  type: SizeType;
}

// ============================================================
// Product
// ============================================================

export interface ResourceImage {
  id: number;
  publicId: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
  createdAt?: string;
}

export interface ProductSpecification {
  specId: number;
  name: string;
  value: string;
}

export interface ProductVariant {
  variantId: number;
  color: Color;
  size: SizeOption;
  skuCode: string;
  price: number;
  salePrice: number | null;
  images: ResourceImage[];
}

export interface Product {
  productId: number;
  category: Category;
  brand: Brand;
  relatedProductId: number | null;
  name: string;
  description: string;
  slug: string;
  isVisible: boolean;
  thumbnail: ResourceImage | null;
  createdAt: string;
  specifications: ProductSpecification[];
  variants: ProductVariant[];
}

export interface RecommendedProduct {
  productId: number;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  minPrice: number;
  minSalePrice: number | null;
}

// ============================================================
// Review
// ============================================================

export interface Review {
  reviewId: number;
  productId: number;
  orderItemId: number;
  customer: Account;
  rating: number;
  comment: string;
  createdAt: string;
}

// ============================================================
// Store & Inventory
// ============================================================

export interface Store {
  storeId: number;
  name: string;
  address: string;
  contact: string;
  longitude: number;
  latitude: number;
  createdAt: string;
  admin: Account | null;
}

export interface Inventory {
  inventoryId: number;
  storeId: number;
  storeName: string;
  variantId: number;
  skuCode: string;
  productId: number;
  productName: string;
  color: Color;
  size: SizeOption;
  quantity: number;
  updatedAt: string;
}

// ============================================================
// Order & Payment
// ============================================================

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURN_REQUESTED";

export type OrderType = "ONLINE" | "IN_STORE";

export type PaymentMethod = "COD" | "BANKING" | "VNPAY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface OrderItem {
  orderItemId: number;
  variantId: number;
  productId: number;
  productName: string;
  skuCode: string;
  color: Color;
  size: SizeOption;
  quantity: number;
  unitPrice: number;
  discountPrice: number | null;
}

export interface Payment {
  paymentId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  vnpayTxnRef: string | null;
  vnpayTransactionNo: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Order {
  orderId: number;
  customerId: number;
  customerName: string;
  storeId: number | null;
  storeName: string | null;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  shippingCode: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientEmail: string | null;
  note: string | null;
  orderDate: string;
  items: OrderItem[];
  payments: Payment[];
}

export interface CreateOrderRequest {
  items: { variantId: number; quantity: number }[];
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientEmail?: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

export interface CreateInStoreOrderRequest {
  customerId: number;
  items: { variantId: number; quantity: number }[];
  paymentMethod: PaymentMethod;
}

// ============================================================
// Dashboard
// ============================================================

export interface DashboardSummary {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  completedOrders: number;
  onlineOrders: number;
  inStoreOrders: number;
}

export interface RevenueByDate {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueByStore {
  storeId: number;
  storeName: string;
  revenue: number;
  orderCount: number;
}

// ============================================================
// VNPay
// ============================================================

export interface VNPayCreateUrlResponse {
  paymentUrl: string;
  txnRef: string;
}

// ============================================================
// Cart (FE-only state, not from backend)
// ============================================================

export interface CartItem {
  variantId: number;
  productId: number;
  productSlug: string;
  productName: string;
  thumbnailUrl: string | null;
  colorName: string;
  sizeName: string;
  skuCode: string;
  unitPrice: number;
  salePrice: number | null;
  quantity: number;
}
