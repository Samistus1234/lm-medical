"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail, buildQuoteConfirmationEmail } from "@/lib/email";
import { generateWhatsAppNotification, sendWhatsAppNotification } from "@/lib/whatsapp";

interface QuoteItem {
  productId: string;
  quantity: number;
}

export async function submitQuote(formData: FormData) {
  const supabase = await createClient();

  const contactName = formData.get("contact_name") as string;
  const contactEmail = formData.get("contact_email") as string;
  const contactPhone = formData.get("contact_phone") as string;
  const organization = formData.get("organization") as string;
  const currency = formData.get("currency") as string;
  const notes = formData.get("notes") as string;
  const cartJson = formData.get("cart_items") as string;

  let cartItems: QuoteItem[];
  try {
    cartItems = JSON.parse(cartJson);
  } catch {
    return { error: "Invalid cart data" };
  }

  if (!cartItems || cartItems.length === 0) {
    return { error: "Cart is empty" };
  }

  // Insert quote
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      quote_number: "", // trigger will auto-generate
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      organization: organization || null,
      currency: currency || "USD",
      notes: notes || null,
      status: "pending",
    })
    .select("id, quote_number")
    .single();

  if (quoteError) {
    return { error: "Failed to submit quote: " + quoteError.message };
  }

  // Insert quote items
  const items = cartItems.map((item) => ({
    quote_id: quote.id,
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(items);

  if (itemsError) {
    return { error: "Failed to add items: " + itemsError.message };
  }

  // Get product names for the confirmation email
  const { data: quoteItemsWithProducts } = await supabase
    .from("quote_items")
    .select("quantity, products(item_name, variant)")
    .eq("quote_id", quote.id);

  const emailData = buildQuoteConfirmationEmail({
    quoteNumber: quote.quote_number,
    contactName: contactName,
    items: (quoteItemsWithProducts || []).map((qi: any) => ({
      name: qi.products?.item_name || "Product",
      variant: qi.products?.variant,
      quantity: qi.quantity,
    })),
  });
  sendEmail({ to: contactEmail, ...emailData }).catch(console.error);

  // Notify team via WhatsApp
  const whatsappMsg = generateWhatsAppNotification({
    quoteNumber: quote.quote_number,
    contactName: contactName,
    organization: organization,
    itemCount: cartItems.length,
    email: contactEmail,
  });
  sendWhatsAppNotification(whatsappMsg).catch(console.error);

  return { success: true, quoteNumber: quote.quote_number };
}
