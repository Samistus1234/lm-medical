"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendDeliveryNotification } from "@/lib/whatsapp";

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();
  const updates: any = { status };
  if (status === "delivered") updates.delivered_at = new Date().toISOString();
  const { error } = await supabase.from("orders").update(updates).eq("id", id);
  if (error) return { error: error.message };

  // Send WhatsApp delivery notification for shipped/delivered
  if (status === "shipped" || status === "delivered") {
    const { data: order } = await supabase
      .from("orders")
      .select("order_number, customers(contact_person, phone), order_items(id)")
      .eq("id", id)
      .single();
    const customer = (order as any)?.customers;
    if (customer?.phone) {
      const phone = customer.phone.replace(/[\s\-\+]/g, "");
      sendDeliveryNotification({
        customerPhone: phone,
        contactName: customer.contact_person || "Customer",
        orderNumber: order!.order_number,
        status: status === "shipped" ? "Shipped" : "Delivered",
        itemCount: (order as any)?.order_items?.length || 0,
      }).catch(console.error);
    }
  }

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
