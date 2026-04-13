"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendQuotePricingReady, sendOrderConfirmed } from "@/lib/whatsapp";

export async function updateQuoteStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  // Send WhatsApp notification when quote is ready
  if (status === "quoted") {
    const { data: quote } = await supabase
      .from("quotes")
      .select("quote_number, contact_name, contact_phone, total_amount, quote_items(id)")
      .eq("id", id)
      .single();
    if (quote?.contact_phone) {
      const phone = quote.contact_phone.replace(/[\s\-\+]/g, "");
      sendQuotePricingReady({
        customerPhone: phone,
        contactName: quote.contact_name || "Customer",
        quoteNumber: quote.quote_number,
        itemCount: quote.quote_items?.length || 0,
        total: `${quote.total_amount || 0}`,
      }).catch(console.error);
    }
  }

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  return { success: true };
}

export async function updateQuoteItemPrice(id: string, unitPrice: number, total: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("quote_items").update({ unit_price: unitPrice, total }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateQuoteTotalAndNotes(id: string, totalAmount: number, internalNotes: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").update({ total_amount: totalAmount, internal_notes: internalNotes }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/quotes/${id}`);
  return { success: true };
}

export async function convertQuoteToOrder(quoteId: string) {
  const supabase = await createClient();

  // Get quote with items
  const { data: quote } = await supabase.from("quotes").select("*, quote_items(*)").eq("id", quoteId).single();
  if (!quote) return { error: "Quote not found" };

  // Find or create customer
  let customerId = quote.customer_id;
  if (!customerId) {
    const { data: newCustomer, error: custErr } = await supabase.from("customers").insert({
      name: quote.organization || quote.contact_name,
      contact_person: quote.contact_name,
      email: quote.contact_email,
      phone: quote.contact_phone,
    }).select("id").single();
    if (custErr) return { error: custErr.message };
    customerId = newCustomer.id;
    await supabase.from("quotes").update({ customer_id: customerId }).eq("id", quoteId);
  }

  // Create order
  const { data: order, error: orderErr } = await supabase.from("orders").insert({
    order_number: "",
    quote_id: quoteId,
    customer_id: customerId,
    currency: quote.currency,
    subtotal: quote.total_amount || 0,
    discount: 0,
    total: quote.total_amount || 0,
  }).select("id, order_number").single();
  if (orderErr) return { error: orderErr.message };

  // Copy items
  const orderItems = quote.quote_items.map((qi: any) => ({
    order_id: order.id,
    product_id: qi.product_id,
    quantity: qi.quantity,
    unit_price: qi.unit_price || 0,
    total: qi.total || 0,
  }));
  if (orderItems.length > 0) {
    await supabase.from("order_items").insert(orderItems);
  }

  // Update quote status
  await supabase.from("quotes").update({ status: "accepted" }).eq("id", quoteId);

  // Send WhatsApp order confirmation to customer
  const customerPhone = quote.contact_phone?.replace(/[\s\-\+]/g, "");
  if (customerPhone) {
    sendOrderConfirmed({
      customerPhone,
      contactName: quote.contact_name || "Customer",
      orderNumber: order.order_number,
      itemCount: quote.quote_items?.length || 0,
      total: `${quote.total_amount || 0}`,
    }).catch(console.error);
  }

  revalidatePath("/admin/quotes");
  revalidatePath("/admin/orders");
  return { success: true, orderNumber: order.order_number };
}
