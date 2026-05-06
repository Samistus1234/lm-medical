import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const supabase = createAdminClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "*, customers(name, email, phone, address, city, country), orders(order_number, order_items(*, products(item_code, item_name, variant))), invoice_items(*, products(item_code, item_name, variant))"
    )
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Standalone invoices store items in invoice_items; order-based invoices
  // still resolve them via orders.order_items.
  const standaloneItems = (invoice.invoice_items || []).map((it: any) => ({
    quantity: it.quantity,
    unit_price: it.unit_price,
    total: it.total,
    products: it.products || (it.description ? { item_code: "", item_name: it.description, variant: null } : null),
  }));
  const orderBasedItems = invoice.orders?.order_items || [];
  const items = standaloneItems.length > 0 ? standaloneItems : orderBasedItems;
  const issueDate = new Date(invoice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const dueDate = new Date(invoice.due_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const paidDate = invoice.paid_at && new Date(invoice.paid_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const statusMap: Record<string, { label: string; gradient: string; glow: string }> = {
    draft: { label: "DRAFT", gradient: "linear-gradient(135deg, #64748b, #94a3b8)", glow: "rgba(100,116,139,0.3)" },
    sent: { label: "AWAITING PAYMENT", gradient: "linear-gradient(135deg, #f59e0b, #f97316)", glow: "rgba(245,158,11,0.3)" },
    paid: { label: "PAID IN FULL", gradient: "linear-gradient(135deg, #10b981, #059669)", glow: "rgba(16,185,129,0.3)" },
    overdue: { label: "OVERDUE", gradient: "linear-gradient(135deg, #ef4444, #dc2626)", glow: "rgba(239,68,68,0.3)" },
    cancelled: { label: "CANCELLED", gradient: "linear-gradient(135deg, #64748b, #475569)", glow: "rgba(100,116,139,0.3)" },
  };
  const status = statusMap[invoice.status] || statusMap.draft;

  let logoBase64 = "";
  try {
    const logoPath = join(process.cwd(), "public", "logo.jpeg");
    logoBase64 = readFileSync(logoPath).toString("base64");
  } catch {}

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Invoice ${invoice.invoice_number} — L&amp;M Medical Solutions</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --navy: #0a0e1a;
    --deep: #0d1b2a;
    --blue: #1a6bb5;
    --sky: #2a8fd4;
    --cyan: #06b6d4;
    --teal: #14b8a6;
    --emerald: #10b981;
    --violet: #8b5cf6;
    --rose: #f43f5e;
    --amber: #f59e0b;
    --gold: #d4a853;
  }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    color: #1e293b;
    font-size: 13px;
    line-height: 1.6;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    min-height: 100vh;
    padding: 40px 20px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    max-width: 860px;
    margin: 0 auto;
    background: #ffffff;
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.1),
      0 25px 50px -12px rgba(0,0,0,0.4),
      0 0 100px rgba(26,107,181,0.08);
  }

  /* ═══ Spectacular Header ═══ */
  .header-bg {
    position: relative;
    padding: 48px 56px 40px;
    background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 25%, #162447 50%, #1a1a5e 75%, #0d1b2a 100%);
    overflow: hidden;
  }

  .header-bg::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(42,143,212,0.15) 0%, transparent 60%);
  }

  .header-bg::after {
    content: '';
    position: absolute;
    bottom: -40%;
    left: -10%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%);
  }

  .header-mesh {
    position: absolute;
    inset: 0;
    opacity: 0.04;
    background-image:
      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .brand {
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }

  .brand-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--blue), var(--cyan));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(26,107,181,0.4);
    flex-shrink: 0;
  }

  .brand-icon span {
    color: white;
    font-family: 'Inter';
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 1px;
  }

  .brand h1 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 500;
    color: #ffffff;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .brand .tagline {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    background: linear-gradient(90deg, var(--sky), var(--cyan), var(--teal));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top: 5px;
  }

  .brand .contact {
    margin-top: 14px;
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    line-height: 1.8;
  }

  .inv-title {
    text-align: right;
  }

  .inv-title h2 {
    font-family: 'Playfair Display', serif;
    font-size: 42px;
    font-weight: 400;
    letter-spacing: 8px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .inv-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: var(--sky);
    margin-top: 8px;
    letter-spacing: 1.5px;
  }

  .status-pill {
    display: inline-block;
    margin-top: 12px;
    padding: 6px 18px;
    border-radius: 24px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #ffffff;
    background: ${status.gradient};
    box-shadow: 0 4px 15px ${status.glow};
  }

  /* ═══ Rainbow accent line ═══ */
  .rainbow-line {
    height: 3px;
    background: linear-gradient(90deg,
      var(--blue) 0%,
      var(--cyan) 20%,
      var(--teal) 35%,
      var(--emerald) 50%,
      var(--amber) 65%,
      var(--violet) 80%,
      var(--blue) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 3s ease infinite;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ═══ Content ═══ */
  .content {
    padding: 44px 56px 48px;
    position: relative;
  }

  /* Watermark */
  .watermark {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-family: 'Playfair Display', serif;
    font-size: 180px;
    font-weight: 700;
    background: linear-gradient(135deg, rgba(26,107,181,0.02), rgba(139,92,246,0.02));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    pointer-events: none;
    user-select: none;
    letter-spacing: 12px;
  }

  /* ═══ Meta Cards ═══ */
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .meta-card {
    padding: 22px 24px;
    border-radius: 14px;
    position: relative;
    overflow: hidden;
  }

  .meta-card:nth-child(1) {
    background: linear-gradient(135deg, #eff6ff, #f0f9ff);
    border: 1px solid rgba(26,107,181,0.12);
  }
  .meta-card:nth-child(2) {
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    border: 1px solid rgba(139,92,246,0.12);
  }
  .meta-card:nth-child(3) {
    background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
    border: 1px solid rgba(16,185,129,0.12);
  }

  .meta-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    opacity: 0.06;
  }

  .meta-card:nth-child(1)::before { background: var(--blue); }
  .meta-card:nth-child(2)::before { background: var(--violet); }
  .meta-card:nth-child(3)::before { background: var(--emerald); }

  .meta-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .meta-card:nth-child(1) .meta-label { color: var(--blue); }
  .meta-card:nth-child(2) .meta-label { color: var(--violet); }
  .meta-card:nth-child(3) .meta-label { color: var(--emerald); }

  .meta-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }

  .meta-card:nth-child(1) .meta-dot { background: var(--blue); }
  .meta-card:nth-child(2) .meta-dot { background: var(--violet); }
  .meta-card:nth-child(3) .meta-dot { background: var(--emerald); }

  .meta-card p { font-size: 12.5px; color: #334155; line-height: 1.7; }
  .meta-card p strong { font-weight: 600; display: block; font-size: 14px; color: #0f172a; margin-bottom: 3px; }
  .meta-card p.dim { color: #64748d; font-size: 11.5px; font-style: italic; }

  /* ═══ Items Table ═══ */
  .items-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    position: relative;
    z-index: 1;
  }

  .items-header h3 {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    background: linear-gradient(90deg, var(--blue), var(--violet));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .items-header::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(26,107,181,0.2), transparent);
  }

  .items-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 36px;
    position: relative;
    z-index: 1;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
    border: 1px solid #e2e8f0;
  }

  .items-table thead th {
    text-align: left;
    padding: 16px 22px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ffffff;
    background: linear-gradient(135deg, #0a0e1a 0%, #162447 40%, #1a1a5e 70%, #0d1b2a 100%);
  }

  .items-table thead th:nth-child(3),
  .items-table thead th:nth-child(4),
  .items-table thead th:last-child { text-align: right; }

  .items-table tbody tr:nth-child(odd) { background: #ffffff; }
  .items-table tbody tr:nth-child(even) { background: #fafcfe; }

  .items-table tbody td {
    padding: 16px 22px;
    font-size: 13px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  .items-table tbody td:nth-child(3),
  .items-table tbody td:nth-child(4),
  .items-table tbody td:last-child { text-align: right; }

  .items-table tbody td:last-child { font-weight: 600; color: #0f172a; }

  .item-name { font-weight: 600; color: #0f172a; font-size: 13px; }
  .item-code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    margin-top: 3px;
    padding: 2px 8px;
    border-radius: 6px;
    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    color: #64748d;
    display: inline-block;
  }
  .item-variant { font-size: 12px; color: #64748b; }

  /* Row number */
  .row-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #cbd5e1;
    font-weight: 500;
  }

  /* ═══ Totals ═══ */
  .totals-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 36px;
    position: relative;
    z-index: 1;
  }

  .totals-card {
    width: 340px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
  }

  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 13px 26px;
    font-size: 13px;
  }

  .totals-row .label { color: #64748d; font-weight: 400; }
  .totals-row .value { color: #1e293b; font-weight: 500; }

  .totals-divider { height: 1px; background: #f1f5f9; margin: 0 26px; }

  .grand-total {
    padding: 20px 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #0a0e1a, #162447, #1a1a5e);
    position: relative;
    overflow: hidden;
  }

  .grand-total::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(42,143,212,0.2), transparent);
  }

  .grand-total .label {
    color: rgba(255,255,255,0.5);
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    font-weight: 700;
    position: relative;
  }

  .grand-total .value {
    position: relative;
    font-size: 26px;
    font-weight: 500;
    font-family: 'Playfair Display', serif;
    background: linear-gradient(135deg, #ffffff, #e0f2fe, var(--cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
  }

  /* ═══ Paid Stamp ═══ */
  .paid-stamp {
    text-align: center;
    margin: 28px 0;
    padding: 24px;
    border-radius: 16px;
    position: relative;
    z-index: 1;
    background: linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0);
    border: 1px solid rgba(16,185,129,0.2);
    box-shadow: 0 4px 20px rgba(16,185,129,0.1);
  }

  .paid-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--emerald), var(--teal));
    margin-bottom: 10px;
    box-shadow: 0 4px 15px rgba(16,185,129,0.3);
  }

  .paid-stamp .title {
    font-size: 16px;
    font-weight: 600;
    color: #059669;
    font-family: 'Playfair Display', serif;
    letter-spacing: 1px;
  }

  .paid-stamp .date { font-size: 12px; color: #64748d; margin-top: 4px; }

  /* ═══ Terms ═══ */
  .terms {
    padding: 24px 28px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fafcfe, #f8fafc);
    border: 1px solid #f1f5f9;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .terms h4 {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
  }

  .terms p { font-size: 11px; color: #64748d; line-height: 1.9; }

  /* ═══ Footer ═══ */
  .footer {
    position: relative;
    z-index: 1;
    padding-top: 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
      var(--blue),
      var(--cyan),
      var(--teal),
      var(--emerald),
      var(--violet),
      var(--blue)
    );
    border-radius: 1px;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .footer-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--deep), var(--blue));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(26,107,181,0.2);
  }

  .footer-icon span { color: white; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; }

  .footer-text { font-size: 11px; color: #94a3b8; line-height: 1.7; }
  .footer-text strong { color: #475569; font-weight: 600; }

  .footer-right {
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #cbd5e1;
    line-height: 2;
    letter-spacing: 0.5px;
  }

  /* ═══ Print ═══ */
  @media print {
    body { background: white !important; padding: 0; }
    .page { box-shadow: none; border-radius: 0; margin: 0; }
    .content { padding: 32px 40px; }
    .rainbow-line { animation: none; }
  }
</style>
</head>
<body>
<div class="page">
  <!-- Watermark -->
  <div class="watermark">L&amp;M</div>

  <!-- ═══ Header ═══ -->
  <div class="header-bg">
    <div class="header-mesh"></div>
    <div class="header-content">
      <div class="brand">
        ${logoBase64 ? `<img src="data:image/jpeg;base64,${logoBase64}" alt="L&M Medical Solutions" style="height:60px;width:auto;margin-right:16px;" />` : `<div class="brand-icon"><span>L&amp;M</span></div>`}
        <div>
          <h1>L&amp;M Medical Solutions</h1>
          <div class="tagline">Orthopedic Implants &amp; Surgical Systems</div>
          <div class="contact">
            Khartoum, Sudan<br>
            info@lmmedicalsolutions.org
          </div>
        </div>
      </div>
      <div class="inv-title">
        <h2>Invoice</h2>
        <div class="inv-number">${invoice.invoice_number}</div>
        <div class="status-pill">${status.label}</div>
      </div>
    </div>
  </div>

  <!-- Rainbow accent -->
  <div class="rainbow-line"></div>

  <!-- ═══ Body ═══ -->
  <div class="content">

    <!-- Meta Cards -->
    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label"><span class="meta-dot"></span> Bill To</div>
        <p>
          <strong>${invoice.customers?.name || "—"}</strong>
          ${invoice.customers?.email ? `${invoice.customers.email}<br>` : ""}
          ${invoice.customers?.phone ? `${invoice.customers.phone}<br>` : ""}
          ${invoice.customers?.address ? `${invoice.customers.address}<br>` : ""}
          ${invoice.customers?.city ? `${invoice.customers.city}${invoice.customers?.country ? `, ${invoice.customers.country}` : ""}` : ""}
        </p>
      </div>
      <div class="meta-card">
        <div class="meta-label"><span class="meta-dot"></span> Invoice Details</div>
        <p>
          <strong>${invoice.invoice_number}</strong>
          Issued: ${issueDate}<br>
          Due: ${dueDate}<br>
          Currency: ${invoice.currency}
        </p>
      </div>
      <div class="meta-card">
        <div class="meta-label"><span class="meta-dot"></span> Payment Info</div>
        <p>
          ${invoice.orders?.order_number ? `<strong>Order ${invoice.orders.order_number}</strong>` : "<strong>Direct Invoice</strong>"}
          <span class="dim">Reference the invoice number<br>on all remittances</span>
        </p>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-header">
      <h3>Line Items</h3>
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%">#</th>
          <th style="width: 35%">Product</th>
          <th style="text-align: right">Qty</th>
          <th style="text-align: right">Unit Price (${invoice.currency})</th>
          <th style="text-align: right">Amount (${invoice.currency})</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: any, i: number) => `
          <tr>
            <td class="row-num">${String(i + 1).padStart(2, '0')}</td>
            <td>
              <div class="item-name">${item.products?.item_name || "—"}</div>
              <span class="item-code">${item.products?.item_code || ""}</span>
              ${item.products?.variant ? `<span class="item-variant" style="margin-left: 6px">${item.products.variant}</span>` : ""}
            </td>
            <td style="text-align: right; font-weight: 500">${item.quantity}</td>
            <td style="text-align: right">${item.unit_price?.toLocaleString() || "—"}</td>
            <td style="text-align: right">${item.total?.toLocaleString() || "—"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-card">
        <div class="totals-row">
          <span class="label">Subtotal</span>
          <span class="value">${invoice.subtotal?.toLocaleString() || "0"} ${invoice.currency}</span>
        </div>
        <div class="totals-divider"></div>
        <div class="totals-row">
          <span class="label">Tax</span>
          <span class="value">${invoice.tax?.toLocaleString() || "0"} ${invoice.currency}</span>
        </div>
        ${invoice.discount ? `
          <div class="totals-divider"></div>
          <div class="totals-row">
            <span class="label">Discount</span>
            <span class="value" style="color: var(--emerald)">-${invoice.discount?.toLocaleString()} ${invoice.currency}</span>
          </div>
        ` : ""}
        <div class="grand-total">
          <span class="label">Total Due</span>
          <span class="value">${invoice.total?.toLocaleString()} ${invoice.currency}</span>
        </div>
      </div>
    </div>

    ${invoice.status === "paid" && paidDate ? `
    <!-- Paid Stamp -->
    <div class="paid-stamp">
      <div class="paid-check">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <div class="title">Payment Received</div>
      <div class="date">Settled on ${paidDate}</div>
    </div>
    ` : ""}

    <!-- Terms -->
    <div class="terms">
      <h4>Terms &amp; Conditions</h4>
      <p>
        Payment is due within 30 days of the invoice date. Please include the invoice number as reference on all remittances.
        All prices are quoted in ${invoice.currency}. Goods remain the property of L&amp;M Medical Solutions until payment is received in full.
        For queries regarding this invoice, please contact our accounts department at ceo@lmmedicalsolutions.org.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">
        ${logoBase64 ? `<img src="data:image/jpeg;base64,${logoBase64}" alt="L&M" style="height:32px;width:auto;margin-right:10px;" />` : `<div class="footer-icon"><span>L&amp;M</span></div>`}
        <div class="footer-text">
          <strong>L&amp;M Medical Solutions</strong><br>
          Premium Orthopedic Implants &amp; Surgical Supplies
        </div>
      </div>
      <div class="footer-right">
        DOC ${invoice.id.substring(0, 8).toUpperCase()}<br>
        GEN ${new Date().toISOString().split('T')[0]}
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

  // If format=pdf, generate actual PDF with jsPDF
  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const customer = invoice.customers;

    // Header
    doc.setFontSize(20);
    doc.text("L&M Medical Solutions", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Orthopedic Implants & Surgical Systems", 20, 27);
    doc.text("Khartoum, Sudan | info@lmmedicalsolutions.org", 20, 32);

    // Invoice title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Invoice ${invoice.invoice_number}`, 20, 48);

    // Status
    doc.setFontSize(10);
    doc.setTextColor(26, 107, 181);
    doc.text(`Status: ${status.label}`, 140, 48);

    // Dates
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text(`Issue Date: ${issueDate}`, 140, 55);
    doc.text(`Due Date: ${dueDate}`, 140, 60);
    if (paidDate) doc.text(`Paid: ${paidDate}`, 140, 65);

    // Customer info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Bill To:", 20, 55);
    doc.setTextColor(60);
    doc.text(customer?.name || "—", 20, 61);
    if (customer?.address) doc.text(customer.address, 20, 66);
    if (customer?.city) doc.text(`${customer.city}${customer.country ? ", " + customer.country : ""}`, 20, 71);
    if (customer?.email) doc.text(customer.email, 20, 76);

    // Items table header
    let y = 90;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, y - 5, 170, 8, "F");
    doc.setFontSize(8);
    doc.setTextColor(39, 57, 81);
    doc.text("ITEM CODE", 22, y);
    doc.text("PRODUCT", 52, y);
    doc.text("QTY", 120, y, { align: "right" });
    doc.text("UNIT PRICE", 150, y, { align: "right" });
    doc.text("TOTAL", 185, y, { align: "right" });
    y += 8;

    // Items
    doc.setFontSize(9);
    doc.setTextColor(10, 22, 40);
    for (const item of items) {
      doc.text(item.products?.item_code || "—", 22, y);
      const productName = `${item.products?.item_name || "—"}${item.products?.variant ? " — " + item.products.variant : ""}`;
      doc.text(productName.substring(0, 40), 52, y);
      doc.text(String(item.quantity), 120, y, { align: "right" });
      doc.text(`${(item.unit_price || 0).toLocaleString()}`, 150, y, { align: "right" });
      doc.text(`${(item.total || 0).toLocaleString()}`, 185, y, { align: "right" });
      y += 7;
      if (y > 260) { doc.addPage(); y = 20; }
    }

    // Totals
    y += 5;
    doc.setDrawColor(229, 237, 245);
    doc.line(120, y, 190, y);
    y += 7;
    doc.setFontSize(9);
    doc.text("Subtotal:", 130, y);
    doc.text(`${(invoice.subtotal || 0).toLocaleString()} ${invoice.currency}`, 185, y, { align: "right" });
    if (invoice.tax) {
      y += 6;
      doc.text("Tax:", 130, y);
      doc.text(`${invoice.tax.toLocaleString()} ${invoice.currency}`, 185, y, { align: "right" });
    }
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(26, 107, 181);
    doc.text("Total:", 130, y);
    doc.text(`${(invoice.total || 0).toLocaleString()} ${invoice.currency}`, 185, y, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("L&M Medical Solutions — Premium Orthopedic Implants & Surgical Supplies", 105, 280, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
