export type UserRole = 'CUSTOMER' | 'CASHIER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  storeId?: string;
  isActive: boolean;
}

export type QueueStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'PROCESSING' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';

export type PaymentMethod = 'UPI' | 'CARD' | 'CASH' | 'DIGITAL_WALLET' | 'SIMULATED_TEST' | 'SELF_CHECKOUT';

export interface QueueEntry {
  id: string;
  _id?: string;
  storeId: string;
  customerId: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | string;
  customerName?: string;
  customerPhone?: string;
  counterId?: {
    _id?: string;
    id?: string;
    counterNumber?: string;
    name?: string;
  } | string;
  ticketNumber: string;
  sequenceNumber?: number;
  paymentMethod?: PaymentMethod;
  status: QueueStatus;
  estimatedWaitTimeMinutes?: number;
  estimatedWaitMinutes?: number;
  createdAt: string;
  joinedAt?: string;
  calledAt?: string;
  servedAt?: string;
  completedAt?: string;
}

export interface Counter {
  id: string;
  _id?: string;
  storeId: string;
  counterNumber: string;
  name?: string;
  assignedCashierId?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  } | string;
  cashierName?: string;
  status: 'OPEN' | 'CLOSED' | 'BUSY';
  acceptedPaymentType: 'ALL' | PaymentMethod;
  currentServingTicketId?: {
    _id?: string;
    ticketNumber?: string;
    status?: QueueStatus;
  } | string;
}

export interface Product {
  id: string;
  _id?: string;
  storeId: string;
  barcode: string;
  name: string;
  brand: string;
  categoryId?: {
    _id?: string;
    name?: string;
    slug?: string;
    icon?: string;
  } | string;
  category?: string;
  price: number;
  costPrice?: number;
  taxPercent?: number;
  unit?: string;
  currentStock?: number;
  stockQuantity?: number;
  imageUrl?: string;
  aisleLocation?: string;
  nutrition?: {
    calories?: number;
    fat?: string;
    protein?: string;
    carbs?: string;
    sugar?: string;
  };
  isHealthyPick: boolean;
  isTrending: boolean;
  isActive?: boolean;
}

export interface OrderItem {
  productId: {
    _id?: string;
    id?: string;
    name?: string;
    barcode?: string;
    imageUrl?: string;
  } | string;
  name?: string;
  barcode?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  customerId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | string;
  customerName?: string;
  storeId: string;
  counterId?: {
    _id?: string;
    counterNumber?: string;
    name?: string;
  } | string;
  cashierId?: {
    _id?: string;
    name?: string;
  } | string;
  items: OrderItem[];
  subtotal: number;
  taxAmount?: number;
  tax?: number;
  discountAmount?: number;
  finalTotal: number;
  totalAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
