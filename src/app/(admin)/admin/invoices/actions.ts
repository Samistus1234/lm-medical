"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, buildInvoiceEmail, buildReceiptEmail } from "@/lib/email";

type SendOutcome = { ok: boolean; reason?: string };

async function waSend(payload: Record<string, unknown>, to: string): Promise<SendOutcome> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!phoneId || !token) return { ok: false, reason: "WhatsApp credentials missing in env" };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, ...payload }),
    });
    const body = await res.json();
    if (!res.ok) {
      const msg =
        body?.error?.error_data?.details ||
        body?.error?.message ||
        `HTTP ${res.status}`;
      return { ok: false, reason: msg };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, reason: err?.message || "fetch failed" };
  }
}

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

  let send: { waResult?: any; waDocResult?: any; emailResult?: any } | undefined;
  if (input.send_now) {
    const result = await updateInvoiceStatus(invoice.id, "sent");
    if ("waResult" in result) {
      send = {
        waResult: result.waResult,
        waDocResult: result.waDocResult,
        emailResult: result.emailResult,
      };
    }
  }

  return {
    success: true,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    send,
  };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  const updates: any = { status };
  if (status === "paid") updates.paid_at = new Date().toISOString();
  const { error } = await supabase.from("invoices").update(updates).eq("id", id);
  if (error) return { error: error.message };

  let waResult: SendOutcome = { ok: false, reason: "skipped" };
  let waDocResult: SendOutcome = { ok: false, reason: "skipped" };
  let emailResult: SendOutcome = { ok: false, reason: "skipped" };

  if (status === "sent" || status === "paid") {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number, total, currency, due_date, customers(contact_person, phone, email)")
      .eq("id", id)
      .single();
    const customer = (invoice as any)?.customers;
    const contactName = customer?.contact_person || "Customer";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lmmedicalsolutions.org";
    const pdfUrl = `${baseUrl}/api/invoices/${id}/pdf?format=pdf`;
    const totalStr = `${invoice!.total || 0}`;
    const currency = (invoice as any)?.currency || "USD";

    if (customer?.phone) {
      const phone = customer.phone.replace(/[\s\-\+]/g, "");
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

      const templateName = status === "sent" ? "invoice_payment_request" : "payment_confirmed";
      const templateParams = status === "sent"
        ? [contactName, invoice!.invoice_number, totalStr, invoice!.due_date || "N/A"]
        : [contactName, invoice!.invoice_number, totalStr];

      waResult = await waSend(
        {
          type: "template",
          template: {
            name: templateName,
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: templateParams.map((t) => ({ type: "text", text: String(t) })),
              },
            ],
          },
        },
        phone
      );

      if (waResult.ok) {
        await delay(1500);
        waDocResult = await waSend(
          {
            type: "document",
            document: {
              link: pdfUrl,
              filename: `${status === "sent" ? "Invoice" : "Receipt"}-${invoice!.invoice_number}.pdf`,
              caption: status === "sent"
                ? `Invoice ${invoice!.invoice_number} — L&M Medical Solutions`
                : `Payment Receipt — ${invoice!.invoice_number}`,
            },
          },
          phone
        );
      } else {
        waDocResult = { ok: false, reason: "skipped (template failed)" };
      }
    } else {
      waResult = { ok: false, reason: "no phone on customer" };
      waDocResult = { ok: false, reason: "no phone on customer" };
    }

    if (customer?.email) {
      const built = status === "sent"
        ? buildInvoiceEmail({
            contactName,
            invoiceNumber: invoice!.invoice_number,
            total: totalStr,
            currency,
            dueDate: invoice!.due_date || "N/A",
            pdfUrl,
          })
        : buildReceiptEmail({
            contactName,
            invoiceNumber: invoice!.invoice_number,
            amount: totalStr,
            currency,
            pdfUrl,
          });
      const ok = await sendEmail({ to: customer.email, ...built });
      emailResult = ok ? { ok: true } : { ok: false, reason: "SMTP send failed" };
    } else {
      emailResult = { ok: false, reason: "no email on customer" };
    }
  }

  revalidatePath("/admin/invoices");
  return { success: true, waResult, waDocResult, emailResult };
}
