import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(name, email, phone, address, city, country), orders(order_number, order_items(*, products(item_code, item_name, variant)))")
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const items = invoice.orders?.order_items || [];

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${invoice.invoice_number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0a1628; font-size: 13px; }
  .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #1a6bb5; padding-bottom: 20px; }
  .company { font-size: 22px; font-weight: 300; color: #0a1628; letter-spacing: -0.5px; }
  .company-sub { font-size: 11px; color: #64748d; margin-top: 4px; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 28px; font-weight: 300; color: #1a6bb5; }
  .invoice-title p { font-size: 12px; color: #64748d; margin-top: 4px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .meta-block h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px; }
  .meta-block p { font-size: 13px; color: #0a1628; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  th { text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #273951; background: #f8fafc; border-bottom: 1px solid #e5edf5; font-weight: 500; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5edf5; font-size: 13px; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals tr td { border: none; padding: 6px 12px; }
  .totals .total-row td { font-size: 16px; font-weight: 400; border-top: 2px solid #0a1628; padding-top: 10px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5edf5; text-align: center; font-size: 11px; color: #94a3b8; }
  .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; }
  .status-paid { background: rgba(21,190,83,0.1); color: #108c3d; }
  .status-sent { background: rgba(42,143,212,0.1); color: #1a6bb5; }
  .status-draft { background: rgba(148,163,184,0.1); color: #64748d; }
  .status-overdue { background: rgba(234,34,97,0.1); color: #ea2261; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .invoice { padding: 0; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div>
      <div class="company">L&amp;M Medical Solutions</div>
      <div class="company-sub">Premium Orthopedic Implants &amp; Surgical Supplies</div>
      <div class="company-sub">Khartoum, Sudan</div>
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <p>${invoice.invoice_number}</p>
      <p class="status status-${invoice.status}">${invoice.status}</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <h4>Bill To</h4>
      <p><strong>${invoice.customers?.name || "—"}</strong></p>
      ${invoice.customers?.email ? `<p>${invoice.customers.email}</p>` : ""}
      ${invoice.customers?.phone ? `<p>${invoice.customers.phone}</p>` : ""}
      ${invoice.customers?.address ? `<p>${invoice.customers.address}</p>` : ""}
      ${invoice.customers?.city ? `<p>${invoice.customers.city}${invoice.customers?.country ? `, ${invoice.customers.country}` : ""}</p>` : ""}
    </div>
    <div class="meta-block" style="text-align: right;">
      <h4>Invoice Details</h4>
      <p>Date: ${new Date(invoice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      <p>Due: ${new Date(invoice.due_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      <p>Currency: ${invoice.currency}</p>
      ${invoice.orders?.order_number ? `<p>Order: ${invoice.orders.order_number}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Code</th>
        <th>Variant</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item: any) => `
        <tr>
          <td>${item.products?.item_name || "—"}</td>
          <td style="font-family: monospace; font-size: 11px; color: #64748d;">${item.products?.item_code || "—"}</td>
          <td>${item.products?.variant || "—"}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${item.unit_price?.toLocaleString() || "—"}</td>
          <td class="text-right">${item.total?.toLocaleString() || "—"}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <table class="totals">
    <tbody>
      <tr>
        <td style="color: #64748d;">Subtotal</td>
        <td class="text-right">${invoice.subtotal?.toLocaleString()} ${invoice.currency}</td>
      </tr>
      <tr>
        <td style="color: #64748d;">Tax</td>
        <td class="text-right">${invoice.tax?.toLocaleString() || "0"} ${invoice.currency}</td>
      </tr>
      <tr class="total-row">
        <td><strong>Total</strong></td>
        <td class="text-right"><strong>${invoice.total?.toLocaleString()} ${invoice.currency}</strong></td>
      </tr>
    </tbody>
  </table>

  ${invoice.status === "paid" && invoice.paid_at ? `<p style="text-align: center; color: #108c3d; font-size: 14px; margin: 20px 0;">&#10003; Paid on ${new Date(invoice.paid_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>` : ""}

  <div class="footer">
    <p>L&amp;M Medical Solutions — Premium Orthopedic Implants &amp; Surgical Supplies</p>
    <p>Thank you for your business</p>
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
