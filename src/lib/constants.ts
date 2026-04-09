export const CURRENCIES = ["SDG", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const QUOTE_STATUSES = [
  "pending",
  "reviewed",
  "quoted",
  "accepted",
  "rejected",
  "expired",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const ORDER_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PIPELINE_STAGES = [
  "lead",
  "contacted",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const TEAM_ROLES = [
  "admin",
  "sales",
  "inventory",
  "viewer",
] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const CUSTOMER_TYPES = [
  "hospital",
  "clinic",
  "distributor",
  "individual",
] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const PRODUCT_CATEGORIES = [
  "Cancellous Screws",
  "Cannulated Screws",
  "External Fixator",
  "Gamma System",
  "Locked Plates",
  "Locked Screws",
  "Nails",
  "Plates",
  "Schanz Screws",
  "Screws",
  "Systems",
  "Wires",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const LOW_STOCK_THRESHOLD = 5;
export const QUOTE_EXPIRY_DAYS = 30;
