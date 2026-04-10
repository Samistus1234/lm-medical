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
