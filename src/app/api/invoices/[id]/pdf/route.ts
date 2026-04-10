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
    .select(
      "*, customers(name, email, phone, address, city, country), orders(order_number, order_items(*, products(item_code, item_name, variant)))"
    )
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const items = invoice.orders?.order_items || [];
  const issueDate = new Date(invoice.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dueDate = new Date(invoice.due_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const paidDate =
    invoice.paid_at &&
    new Date(invoice.paid_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const statusMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
    draft: { label: "DRAFT", bg: "#f1f5f9", color: "#64748d", border: "#cbd5e1" },
    sent: { label: "AWAITING PAYMENT", bg: "#eff6ff", color: "#1a6bb5", border: "#bfdbfe" },
    paid: { label: "PAID", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    overdue: { label: "OVERDUE", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    cancelled: { label: "CANCELLED", bg: "#f1f5f9", color: "#64748d", border: "#cbd5e1" },
  };
  const status = statusMap[invoice.status] || statusMap.draft;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Invoice ${invoice.invoice_number} — L&amp;M Medical Solutions</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
    font-size: 13px;
    line-height: 1.6;
    background: #f8fafc;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    max-width: 820px;
    margin: 0 auto;
    background: #ffffff;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
  }

  /* ─── Top accent bar ─── */
  .accent-bar {
    height: 6px;
    background: linear-gradient(90deg, #0d1b2a 0%, #1a6bb5 35%, #2a8fd4 65%, #0d1b2a 100%);
  }

  /* ─── Watermark ─── */
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-family: 'Playfair Display', serif;
    font-size: 140px;
    font-weight: 400;
    color: rgba(26, 107, 181, 0.02);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    letter-spacing: 8px;
  }

  .content {
    padding: 48px 56px 40px;
    position: relative;
    z-index: 1;
  }

  /* ─── Header ─── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 48px;
  }

  .brand {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .brand-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0d1b2a, #1a6bb5);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .brand-icon span {
    color: white;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.5px;
  }

  .brand-text h1 {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 500;
    color: #0d1b2a;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .brand-text .tagline {
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-top: 4px;
  }

  .brand-text .contact-info {
    margin-top: 12px;
    font-size: 11px;
    color: #64748d;
    line-height: 1.8;
  }

  .invoice-badge {
    text-align: right;
  }

  .invoice-badge h2 {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 400;
    color: #0d1b2a;
    letter-spacing: 6px;
    text-transform: uppercase;
  }

  .invoice-badge .inv-number {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #1a6bb5;
    margin-top: 6px;
    letter-spacing: 1px;
  }

  .status-pill {
    display: inline-block;
    margin-top: 10px;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    background: ${status.bg};
    color: ${status.color};
    border: 1px solid ${status.border};
  }

  /* ─── Divider ─── */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    margin: 0 0 36px;
  }

  /* ─── Meta grid ─── */
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
    margin-bottom: 40px;
  }

  .meta-card {
    padding: 20px 24px;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    background: #fafcfe;
  }

  .meta-card h4 {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .meta-card h4::before {
    content: '';
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #1a6bb5;
  }

  .meta-card p {
    font-size: 13px;
    color: #0f172a;
    line-height: 1.7;
  }

  .meta-card p strong {
    font-weight: 500;
    display: block;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .meta-card p.dim {
    color: #64748d;
    font-size: 12px;
  }

  /* ─── Items Table ─── */
  .items-section {
    margin-bottom: 36px;
  }

  .items-section h3 {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .items-section h3::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #f1f5f9;
  }

  .items-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .items-table thead th {
    text-align: left;
    padding: 14px 20px;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #ffffff;
    background: linear-gradient(135deg, #0d1b2a, #1a2d42);
  }

  .items-table thead th:last-child { text-align: right; }
  .items-table thead th:nth-child(4),
  .items-table thead th:nth-child(5) { text-align: right; }

  .items-table tbody tr { transition: background 0.15s; }
  .items-table tbody tr:nth-child(even) { background: #fafcfe; }
  .items-table tbody tr:hover { background: #f1f5f9; }

  .items-table tbody td {
    padding: 14px 20px;
    font-size: 13px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  .items-table tbody td:last-child { text-align: right; font-weight: 500; }
  .items-table tbody td:nth-child(4),
  .items-table tbody td:nth-child(5) { text-align: right; }

  .item-name { font-weight: 500; color: #0f172a; }
  .item-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .item-variant { font-size: 12px; color: #64748d; }

  /* ─── Totals ─── */
  .totals-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 40px;
  }

  .totals-card {
    width: 320px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .totals-card .row {
    display: flex;
    justify-content: space-between;
    padding: 12px 24px;
    font-size: 13px;
  }

  .totals-card .row .label { color: #64748d; }
  .totals-card .row .value { color: #0f172a; font-weight: 400; }

  .totals-card .row-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 0 24px;
  }

  .totals-card .total-row {
    background: linear-gradient(135deg, #0d1b2a, #1a2d42);
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .totals-card .total-row .label {
    color: rgba(255,255,255,0.6);
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .totals-card .total-row .value {
    color: #ffffff;
    font-size: 22px;
    font-weight: 500;
    font-family: 'Playfair Display', serif;
    letter-spacing: 0.5px;
  }

  /* ─── Paid stamp ─── */
  .paid-stamp {
    text-align: center;
    margin: 24px 0;
    padding: 16px;
    border-radius: 12px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
  }

  .paid-stamp .check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #059669;
    margin-bottom: 8px;
  }

  .paid-stamp p {
    font-size: 13px;
    color: #059669;
    font-weight: 500;
  }

  .paid-stamp .date {
    font-size: 11px;
    color: #64748d;
    margin-top: 2px;
  }

  /* ─── Terms ─── */
  .terms {
    padding: 24px;
    border-radius: 12px;
    background: #fafcfe;
    border: 1px solid #f1f5f9;
    margin-bottom: 40px;
  }

  .terms h4 {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
  }

  .terms p {
    font-size: 11px;
    color: #64748d;
    line-height: 1.8;
  }

  /* ─── Footer ─── */
  .footer {
    border-top: 1px solid #f1f5f9;
    padding-top: 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .footer-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #0d1b2a, #1a6bb5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-icon span {
    color: white;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .footer-text {
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.6;
  }

  .footer-text strong {
    color: #64748d;
    font-weight: 500;
  }

  .footer-right {
    text-align: right;
    font-size: 10px;
    color: #cbd5e1;
    line-height: 1.8;
  }

  /* ─── Print ─── */
  @media print {
    body { background: white; }
    .page { box-shadow: none; margin: 0; }
    .content { padding: 32px 40px; }
  }

  @media screen {
    .page {
      margin: 40px auto;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 50px -12px rgba(0,0,0,0.12);
      border-radius: 4px;
    }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Accent bar -->
  <div class="accent-bar"></div>

  <!-- Watermark -->
  <div class="watermark">L&amp;M</div>

  <div class="content">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="brand-icon"><span>L&amp;M</span></div>
        <div class="brand-text">
          <h1>L&amp;M Medical Solutions</h1>
          <div class="tagline">Orthopedic Implants &amp; Surgical Systems</div>
          <div class="contact-info">
            Khartoum, Sudan<br>
            info@lmmedical.com
          </div>
        </div>
      </div>
      <div class="invoice-badge">
        <h2>Invoice</h2>
        <div class="inv-number">${invoice.invoice_number}</div>
        <div class="status-pill">${status.label}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Meta Cards -->
    <div class="meta-grid">
      <div class="meta-card">
        <h4>Bill To</h4>
        <p>
          <strong>${invoice.customers?.name || "—"}</strong>
          ${invoice.customers?.email ? `${invoice.customers.email}<br>` : ""}
          ${invoice.customers?.phone ? `${invoice.customers.phone}<br>` : ""}
          ${invoice.customers?.address ? `${invoice.customers.address}<br>` : ""}
          ${invoice.customers?.city ? `${invoice.customers.city}${invoice.customers?.country ? `, ${invoice.customers.country}` : ""}` : ""}
        </p>
      </div>
      <div class="meta-card">
        <h4>Invoice Details</h4>
        <p>
          <strong>${invoice.invoice_number}</strong>
          Issue Date: ${issueDate}<br>
          Due Date: ${dueDate}<br>
          Currency: ${invoice.currency}
        </p>
      </div>
      <div class="meta-card">
        <h4>Payment Reference</h4>
        <p>
          ${invoice.orders?.order_number ? `<strong>Order: ${invoice.orders.order_number}</strong>` : ""}
          <span class="dim">Please reference the invoice<br>number on all payments</span>
        </p>
      </div>
    </div>

    <!-- Items -->
    <div class="items-section">
      <h3>Line Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 35%">Product</th>
            <th>Variant</th>
            <th style="text-align: right">Qty</th>
            <th style="text-align: right">Unit Price</th>
            <th style="text-align: right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item: any) => `
            <tr>
              <td>
                <div class="item-name">${item.products?.item_name || "—"}</div>
                <div class="item-code">${item.products?.item_code || ""}</div>
              </td>
              <td class="item-variant">${item.products?.variant || "—"}</td>
              <td style="text-align: right">${item.quantity}</td>
              <td style="text-align: right">${item.unit_price?.toLocaleString() || "—"}</td>
              <td style="text-align: right; font-weight: 500">${item.total?.toLocaleString() || "—"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-card">
        <div class="row">
          <span class="label">Subtotal</span>
          <span class="value">${invoice.subtotal?.toLocaleString() || "0"} ${invoice.currency}</span>
        </div>
        <div class="row-divider"></div>
        <div class="row">
          <span class="label">Tax</span>
          <span class="value">${invoice.tax?.toLocaleString() || "0"} ${invoice.currency}</span>
        </div>
        ${
          invoice.discount
            ? `<div class="row-divider"></div>
        <div class="row">
          <span class="label">Discount</span>
          <span class="value">-${invoice.discount?.toLocaleString()} ${invoice.currency}</span>
        </div>`
            : ""
        }
        <div class="total-row">
          <span class="label">Total Due</span>
          <span class="value">${invoice.total?.toLocaleString()} ${invoice.currency}</span>
        </div>
      </div>
    </div>

    ${
      invoice.status === "paid" && paidDate
        ? `
    <!-- Paid Stamp -->
    <div class="paid-stamp">
      <div class="check">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <p>Payment Received</p>
      <p class="date">${paidDate}</p>
    </div>
    `
        : ""
    }

    <!-- Terms -->
    <div class="terms">
      <h4>Terms &amp; Conditions</h4>
      <p>
        Payment is due within 30 days of the invoice date. Please include the invoice number as reference when making payment.
        All prices are in ${invoice.currency}. Goods remain the property of L&amp;M Medical Solutions until payment is received in full.
        For queries regarding this invoice, please contact our accounts team at accounts@lmmedical.com.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">
        <div class="footer-icon"><span>L&amp;M</span></div>
        <div class="footer-text">
          <strong>L&amp;M Medical Solutions</strong><br>
          Premium Orthopedic Implants &amp; Surgical Supplies
        </div>
      </div>
      <div class="footer-right">
        Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}<br>
        Document ID: ${invoice.id.substring(0, 8).toUpperCase()}
      </div>
    </div>
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
