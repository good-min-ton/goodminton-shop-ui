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

/**
 * Spring Boot 3+ PagedModel shape: pagination metadata is nested under `page`.
 * `page.number` is 0-based per Spring convention; FE state still 1-based.
 */
export interface PageMeta {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: PageMeta;
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
  id: number;
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
  thumbnail: ResourceImage | null;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Color {
  id: number;
  name: string;
  hexCode?: string; // not in API but useful client-side; leave optional
}

export type SizeType = "RACKET" | "NON_RACKET";

export interface SizeOption {
  id: number;
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
  id: number;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: number;
  color: Color;
  size: SizeOption;
  skuCode: string;
  price: number;
  salePrice: number | null;
  images: ResourceImage[];
}

export interface Product {
  id: number;
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

/**
 * Lightweight product shape returned by recommendations + search endpoints.
 * Just enough for cards: id, name, slug, thumb, price.
 */
export interface ProductListItem {
  id: number;
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
  id: number;
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
  id: number;
  name: string;
  address: string;
  contact: string;
  longitude: number;
  latitude: number;
  isCentral: boolean;
  createdAt: string;
  admin: Account | null;
}

export interface Inventory {
  id: number;
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
  id: number;
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
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  vnpayTxnRef: string | null;
  vnpayTransactionNo: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
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
