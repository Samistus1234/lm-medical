"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendInvoicePaymentRequest, sendPaymentConfirmed, sendWhatsAppDocument } from "@/lib/whatsapp";

interface NewInvoiceItem {
  product_id?: string | null;
  description?: string | null;
  quantity: number;
  unit_price: number;
}

interface NewInvoiceInput {
  customer_id?: string | null;
  new_customer?: {
    name: string;
    contact_person?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  currency: "USD" | "SDG";
  due_date: string;
  items: NewInvoiceItem[];
  send_now?: boolean;
}

export async function createStandaloneInvoice(input: NewInvoiceInput) {
  const supabase = await createClient();

  let customerId = input.customer_id || null;
  if (!customerId) {
    if (!input.new_customer?.name) return { error: "Customer is required" };
    const { data: cust, error: cErr } = await supabase
      .from("customers")
      .insert({
        name: input.new_customer.name,
        contact_person: input.new_customer.contact_person || null,
        email: input.new_customer.email || null,
        phone: input.new_customer.phone || null,
      })
      .select("id")
      .single();
    if (cErr) return { error: cErr.message };
    customerId = cust.id;
  }

  const items = (input.items || []).filter(
    (it) => (it.product_id || it.description) && it.quantity > 0
  );
  if (items.length === 0) return { error: "Add at least one line item" };

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0
  );

  const { data: invoice, error: iErr } = await supabase
    .from("invoices")
    .insert({
      invoice_number: "",
      order_id: null,
      customer_id: customerId,
      currency: input.currency,
      subtotal,
      tax: 0,
      total: subtotal,
      due_date: input.due_date,
      status: "draft",
    })
    .select("id, invoice_number")
    .single();
  if (iErr) return { error: iErr.message };

  const itemRows = items.map((it) => ({
    invoice_id: invoice.id,
    product_id: it.product_id || null,
    description: it.description || null,
    quantity: it.quantity,
    unit_price: it.unit_price,
    total: (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
  }));
  const { error: itErr } = await supabase.from("invoice_items").insert(itemRows);
  if (itErr) return { error: itErr.message };

  revalidatePath("/admin/invoices");
  revalidatePath("/admin");

  if (input.send_now) {
    // Reuse the existing send flow (template + PDF).
    await updateInvoiceStatus(invoice.id, "sent");
  }

  return { success: true, invoiceId: invoice.id, invoiceNumber: invoice.invoice_number };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  const updates: any = { status };
  if (status === "paid") updates.paid_at = new Date().toISOString();
  const { error } = await supabase.from("invoices").update(updates).eq("id", id);
  if (error) return { error: error.message };

  // Send WhatsApp notifications for invoice status changes
  if (status === "sent" || status === "paid") {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number, total, due_date, customers(contact_person, phone)")
      .eq("id", id)
      .single();
    const customer = (invoice as any)?.customers;
    if (customer?.phone) {
      const phone = customer.phone.replace(/[\s\-\+]/g, "");
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lmmedicalsolutions.org";
      const pdfUrl = `${baseUrl}/api/invoices/${id}/pdf?format=pdf`;

      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

      if (status === "sent") {
        // Send template message first, wait, then PDF
        sendInvoicePaymentRequest({
          customerPhone: phone,
          contactName: customer.contact_person || "Customer",
          invoiceNumber: invoice!.invoice_number,
          total: `${invoice!.total || 0}`,
          dueDate: invoice!.due_date || "N/A",
        }).then(async () => {
          await delay(3000);
          sendWhatsAppDocument({
            to: phone,
            documentUrl: pdfUrl,
            filename: `Invoice-${invoice!.invoice_number}.pdf`,
            caption: `Invoice ${invoice!.invoice_number} — L&M Medical Solutions`,
          }).catch(console.error);
        }).catch(console.error);
      } else if (status === "paid") {
        // Send payment confirmation, wait, then receipt PDF
        sendPaymentConfirmed({
          customerPhone: phone,
          contactName: customer.contact_person || "Customer",
          invoiceNumber: invoice!.invoice_number,
          amount: `${invoice!.total || 0}`,
        }).then(async () => {
          await delay(3000);
          sendWhatsAppDocument({
            to: phone,
            documentUrl: pdfUrl,
            filename: `Receipt-${invoice!.invoice_number}.pdf`,
            caption: `Payment Receipt — ${invoice!.invoice_number}`,
          }).catch(console.error);
        }).catch(console.error);
      }
    }
  }

  revalidatePath("/admin/invoices");
  return { success: true };
}
