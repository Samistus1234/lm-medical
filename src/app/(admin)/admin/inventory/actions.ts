"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProduct(id: string, data: Record<string, any>) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    item_code: formData.get("item_code") as string,
    category: formData.get("category") as string,
    item_name: formData.get("item_name") as string,
    variant: (formData.get("variant") as string) || null,
    supplier_id: (formData.get("supplier_id") as string) || null,
    notes: (formData.get("notes") as string) || null,
    stock_qty: parseInt(formData.get("stock_qty") as string) || 0,
    cost_price_sdg: parseFloat(formData.get("cost_price_sdg") as string) || 0,
    sale_price_sdg: parseFloat(formData.get("sale_price_sdg") as string) || 0,
    cost_price_usd: parseFloat(formData.get("cost_price_usd") as string) || 0,
    sale_price_usd: parseFloat(formData.get("sale_price_usd") as string) || 0,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}

interface BulkProductInput {
  item_code: string;
  item_name: string;
  category: string;
  variant: string | null;
  stock_qty: number;
  supplier_id: string | null;
}

export async function createProductsBulk(rows: BulkProductInput[]) {
  if (!rows.length) return { error: "no rows" };
  const supabase = await createClient();
  const payload = rows.map((r) => ({
    ...r,
    cost_price_sdg: 0,
    sale_price_sdg: 0,
    cost_price_usd: 0,
    sale_price_usd: 0,
    is_active: true,
  }));
  const { error, count } = await supabase
    .from("products")
    .upsert(payload, { onConflict: "item_code", count: "exact" });
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true, count: count ?? rows.length };
}
