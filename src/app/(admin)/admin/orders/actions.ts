"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();
  const updates: any = { status };
  if (status === "delivered") updates.delivered_at = new Date().toISOString();
  const { error } = await supabase.from("orders").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function generateInvoice(orderId: string) {
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order) return { error: "Order not found" };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const { data: invoice, error } = await supabase.from("invoices").insert({
    invoice_number: "",
    order_id: orderId,
    customer_id: order.customer_id,
    currency: order.currency,
    subtotal: order.subtotal,
    tax: 0,
    total: order.total,
    due_date: dueDate.toISOString().split("T")[0],
  }).select("id, invoice_number").single();
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/admin/invoices");
  return { success: true, invoiceNumber: invoice.invoice_number };
}
