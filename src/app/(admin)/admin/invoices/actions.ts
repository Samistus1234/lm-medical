"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendInvoicePaymentRequest, sendPaymentConfirmed, sendWhatsAppDocument } from "@/lib/whatsapp";

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
      const pdfUrl = `${baseUrl}/api/invoices/${id}/pdf`;

      if (status === "sent") {
        // Send template message first, then PDF
        sendInvoicePaymentRequest({
          customerPhone: phone,
          contactName: customer.contact_person || "Customer",
          invoiceNumber: invoice!.invoice_number,
          total: `${invoice!.total || 0}`,
          dueDate: invoice!.due_date || "N/A",
        }).then(() => {
          // Follow up with PDF document
          sendWhatsAppDocument({
            to: phone,
            documentUrl: pdfUrl,
            filename: `Invoice-${invoice!.invoice_number}.pdf`,
            caption: `Invoice ${invoice!.invoice_number} — L&M Medical Solutions`,
          }).catch(console.error);
        }).catch(console.error);
      } else if (status === "paid") {
        // Send payment confirmation, then receipt PDF
        sendPaymentConfirmed({
          customerPhone: phone,
          contactName: customer.contact_person || "Customer",
          invoiceNumber: invoice!.invoice_number,
          amount: `${invoice!.total || 0}`,
        }).then(() => {
          // Follow up with receipt PDF
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
