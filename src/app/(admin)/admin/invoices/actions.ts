"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendInvoicePaymentRequest, sendPaymentConfirmed } from "@/lib/whatsapp";

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
      if (status === "sent") {
        sendInvoicePaymentRequest({
          customerPhone: phone,
          contactName: customer.contact_person || "Customer",
          invoiceNumber: invoice!.invoice_number,
          total: `${invoice!.total || 0}`,
          dueDate: invoice!.due_date || "N/A",
        }).catch(console.error);
      } else if (status === "paid") {
        sendPaymentConfirmed({
          customerPhone: phone,
          contactName: customer.contact_person || "Customer",
          invoiceNumber: invoice!.invoice_number,
          amount: `${invoice!.total || 0}`,
        }).catch(console.error);
      }
    }
  }

  revalidatePath("/admin/invoices");
  return { success: true };
}
