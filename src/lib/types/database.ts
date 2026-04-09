import type {
  Currency,
  QuoteStatus,
  OrderStatus,
  InvoiceStatus,
  PipelineStage,
  TeamRole,
  CustomerType,
} from "@/lib/constants";

export interface Product {
  id: string;
  item_code: string;
  category: string;
  item_name: string;
  variant: string | null;
  description: string | null;
  notes: string | null;
  stock_qty: number;
  cost_price_sdg: number;
  sale_price_sdg: number;
  cost_price_usd: number;
  sale_price_usd: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface Customer {
  id: string;
  type: CustomerType;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_id: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  organization: string | null;
  status: QuoteStatus;
  currency: Currency;
  total_amount: number | null;
  notes: string | null;
  internal_notes: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  unit_price: number | null;
  total: number | null;
}

export interface Order {
  id: string;
  order_number: string;
  quote_id: string | null;
  customer_id: string;
  status: OrderStatus;
  currency: Currency;
  subtotal: number;
  discount: number;
  total: number;
  shipping_address: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_id: string;
  status: InvoiceStatus;
  currency: Currency;
  subtotal: number;
  tax: number;
  total: number;
  due_date: string;
  paid_at: string | null;
  pdf_url: string | null;
  created_at: string;
}

export interface PipelineDeal {
  id: string;
  customer_id: string;
  title: string;
  stage: PipelineStage;
  value_sdg: number | null;
  value_usd: number | null;
  probability: number;
  assigned_to: string | null;
  expected_close: string | null;
  notes: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  title_ar: string | null;
  slug: string;
  content: string;
  content_ar: string | null;
  cover_image: string | null;
  author: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  is_active: boolean;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
