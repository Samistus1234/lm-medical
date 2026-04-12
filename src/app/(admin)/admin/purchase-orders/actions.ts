"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPurchaseOrder(
  supplierId: string,
  items: { productId: string; quantity: number; unitCost: number }[]
) {
  const supabase = await createClient();
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({ supplier_id: supplierId, subtotal, currency: "USD" })
    .select()
    .single();

  if (poError) return { error: poError.message };

  const poItems = items.map((item) => ({
    purchase_order_id: po.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_cost: item.unitCost,
    total: item.quantity * item.unitCost,
  }));

  const { error: itemsError } = await supabase.from("purchase_order_items").insert(poItems);
  if (itemsError) return { error: itemsError.message };

  revalidatePath("/admin/purchase-orders");
  return { success: true, poNumber: po.po_number, poId: po.id };
}

export async function updatePOStatus(id: string, status: string) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "sent") updates.sent_at = new Date().toISOString();
  if (status === "received") updates.received_at = new Date().toISOString();

  const { error } = await supabase.from("purchase_orders").update(updates).eq("id", id);
  if (error) return { error: error.message };

  if (status === "received") {
    const { data: items } = await supabase
      .from("purchase_order_items")
      .select("product_id, quantity")
      .eq("purchase_order_id", id);

    if (items) {
      for (const item of items) {
        await supabase.rpc("increment_stock", { p_id: item.product_id, qty: item.quantity });
      }
    }
  }

  revalidatePath("/admin/purchase-orders");
  return { success: true };
}

export async function deletePurchaseOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/purchase-orders");
  return { success: true };
}
