"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { sendPOToSupplier } from "@/lib/whatsapp";

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

export async function sendPOEmail(poId: string) {
  const supabase = await createClient();

  const { data: po } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name, contact_person, email), purchase_order_items(*, products(item_code, item_name, variant))")
    .eq("id", poId)
    .single();

  if (!po) return { error: "Purchase order not found" };
  if (!po.suppliers?.email) return { error: "Supplier has no email address" };

  const items = po.purchase_order_items || [];
  const itemRows = items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5edf5;">${item.products?.item_code || "—"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5edf5;">${item.products?.item_name || "—"}${item.products?.variant ? ` — ${item.products.variant}` : ""}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5edf5;text-align:right;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5edf5;text-align:right;">${item.unit_cost?.toLocaleString()}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5edf5;text-align:right;">${item.total?.toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0a1628;max-width:700px;margin:0 auto;padding:20px;">
  <div style="border-bottom:2px solid #1a6bb5;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:22px;font-weight:300;color:#0a1628;margin:0;">L&M Medical Solutions</h1>
  </div>

  <p style="font-size:15px;">Dear ${po.suppliers.contact_person || po.suppliers.name},</p>
  <p style="font-size:15px;color:#64748d;">Please find below our purchase order <strong>${po.po_number}</strong>.</p>

  <div style="background:#f8fafc;border:1px solid #e5edf5;border-radius:6px;padding:16px;margin:24px 0;">
    <p style="font-size:13px;color:#64748d;margin:0 0 4px;">PO Reference</p>
    <p style="font-size:18px;color:#1a6bb5;margin:0;font-weight:400;">${po.po_number}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead><tr>
      <th style="text-align:left;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5edf5;color:#273951;font-weight:500;font-size:11px;text-transform:uppercase;">Code</th>
      <th style="text-align:left;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5edf5;color:#273951;font-weight:500;font-size:11px;text-transform:uppercase;">Product</th>
      <th style="text-align:right;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5edf5;color:#273951;font-weight:500;font-size:11px;text-transform:uppercase;">Qty</th>
      <th style="text-align:right;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5edf5;color:#273951;font-weight:500;font-size:11px;text-transform:uppercase;">Unit Cost</th>
      <th style="text-align:right;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5edf5;color:#273951;font-weight:500;font-size:11px;text-transform:uppercase;">Total</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
    <tfoot><tr>
      <td colspan="4" style="text-align:right;padding:8px 12px;font-weight:500;color:#273951;">Subtotal</td>
      <td style="text-align:right;padding:8px 12px;font-weight:500;color:#0a1628;">${po.subtotal?.toLocaleString()} ${po.currency}</td>
    </tr></tfoot>
  </table>

  ${po.notes ? `<p style="font-size:14px;color:#64748d;margin-top:24px;">Notes: ${po.notes}</p>` : ""}

  <div style="border-top:1px solid #e5edf5;margin-top:32px;padding-top:16px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;">L&M Medical Solutions — Premium Orthopedic Implants & Surgical Supplies</p>
    <p style="font-size:11px;color:#94a3b8;">Khartoum, Sudan | info@lmmedicalsolutions.org</p>
  </div>
</body>
</html>`;

  const sent = await sendEmail({
    to: po.suppliers.email,
    subject: `Purchase Order ${po.po_number} — L&M Medical Solutions`,
    html,
  });

  if (!sent) return { error: "Failed to send email" };

  // Update status to sent if currently draft
  if (po.status === "draft") {
    await supabase
      .from("purchase_orders")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", poId);
  }

  revalidatePath("/admin/purchase-orders");
  revalidatePath(`/admin/purchase-orders/${poId}`);
  return { success: true };
}

export async function sendPOWhatsApp(poId: string) {
  const supabase = await createClient();

  const { data: po } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name, contact_person, whatsapp), purchase_order_items(*, products(item_code, item_name, variant))")
    .eq("id", poId)
    .single();

  if (!po) return { error: "Purchase order not found" };
  if (!po.suppliers?.whatsapp) return { error: "Supplier has no WhatsApp number" };

  const items = po.purchase_order_items || [];

  // Clean the phone number — remove +, spaces, dashes
  const cleanPhone = po.suppliers.whatsapp.replace(/[\s\-\+]/g, "");

  const sent = await sendPOToSupplier({
    supplierPhone: cleanPhone,
    poNumber: po.po_number,
    contactPerson: po.suppliers.contact_person || po.suppliers.name,
    itemCount: items.length,
    subtotal: `${po.subtotal?.toLocaleString()} ${po.currency}`,
  });

  if (!sent) return { error: "Failed to send WhatsApp message" };

  // Update status to sent if currently draft
  if (po.status === "draft") {
    await supabase
      .from("purchase_orders")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", poId);
  }

  revalidatePath("/admin/purchase-orders");
  revalidatePath(`/admin/purchase-orders/${poId}`);
  return { success: true };
}
