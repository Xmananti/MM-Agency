export type UserRole = 'SUPER_ADMIN' | 'VENDOR' | 'CUSTOMER';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  vendor_id: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface Vendor {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  commission_rate: number;
  is_verified: boolean;
  created_at: Date;
}

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  vendor_id: string;
  category_id: string | null;
  brand_id: string | null;
  image_urls: string[];
  is_active: boolean;
  created_at: Date;
}

export type CustomerProductRelationType = 'WISHLIST' | 'FAVORITE' | 'VIEWED';

export interface CustomerProductRelation {
  id: string;
  customer_id: string;
  product_id: string;
  relation_type: CustomerProductRelationType;
  created_at: Date;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  platform_commission: number;
  status: OrderStatus;
  created_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  price: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  vendorId: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
