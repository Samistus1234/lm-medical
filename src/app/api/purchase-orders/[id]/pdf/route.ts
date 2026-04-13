import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  const { data: po } = await supabase
    .from("purchase_orders")
    .select(
      "*, suppliers(name, contact_person, email, phone, address, city, country), purchase_order_items(*, products(item_code, item_name, variant))"
    )
    .eq("id", id)
    .single();

  if (!po) {
    return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
  }

  const items = po.purchase_order_items || [];
  const poDate = new Date(po.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sentDate = po.sent_at && new Date(po.sent_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const receivedDate = po.received_at && new Date(po.received_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const statusMap: Record<string, { label: string; gradient: string; glow: string }> = {
    draft: { label: "DRAFT", gradient: "linear-gradient(135deg, #64748b, #94a3b8)", glow: "rgba(100,116,139,0.3)" },
    sent: { label: "SENT TO SUPPLIER", gradient: "linear-gradient(135deg, #f59e0b, #f97316)", glow: "rgba(245,158,11,0.3)" },
    confirmed: { label: "CONFIRMED", gradient: "linear-gradient(135deg, #3b82f6, #2563eb)", glow: "rgba(59,130,246,0.3)" },
    received: { label: "RECEIVED", gradient: "linear-gradient(135deg, #10b981, #059669)", glow: "rgba(16,185,129,0.3)" },
    cancelled: { label: "CANCELLED", gradient: "linear-gradient(135deg, #64748b, #475569)", glow: "rgba(100,116,139,0.3)" },
  };
  const status = statusMap[po.status] || statusMap.draft;

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
<title>Purchase Order ${po.po_number} — L&amp;M Medical Solutions</title>
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

  /* Header */
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

  .po-title {
    text-align: right;
  }

  .po-title h2 {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 400;
    letter-spacing: 4px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.1;
  }

  .po-title .po-subtitle {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 6px;
    text-transform: uppercase;
    background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .po-number {
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

  /* Rainbow accent line */
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

  /* Content */
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
    font-size: 160px;
    font-weight: 700;
    background: linear-gradient(135deg, rgba(26,107,181,0.02), rgba(139,92,246,0.02));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    pointer-events: none;
    user-select: none;
    letter-spacing: 12px;
  }

  /* Meta Cards */
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

  /* Items Table */
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

  .items-table thead th:nth-child(4),
  .items-table thead th:nth-child(5),
  .items-table thead th:last-child { text-align: right; }

  .items-table tbody tr:nth-child(odd) { background: #ffffff; }
  .items-table tbody tr:nth-child(even) { background: #fafcfe; }

  .items-table tbody td {
    padding: 16px 22px;
    font-size: 13px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  .items-table tbody td:nth-child(4),
  .items-table tbody td:nth-child(5),
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

  /* Totals */
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

  /* Received Stamp */
  .received-stamp {
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

  .received-check {
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

  .received-stamp .title {
    font-size: 16px;
    font-weight: 600;
    color: #059669;
    font-family: 'Playfair Display', serif;
    letter-spacing: 1px;
  }

  .received-stamp .date { font-size: 12px; color: #64748d; margin-top: 4px; }

  /* Notes */
  .notes {
    padding: 24px 28px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fafcfe, #f8fafc);
    border: 1px solid #f1f5f9;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .notes h4 {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 10px;
  }

  .notes p { font-size: 11px; color: #64748d; line-height: 1.9; }

  /* Footer */
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

  /* Print */
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
  <div class="watermark">P.O.</div>

  <!-- Header -->
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
      <div class="po-title">
        <h2>Purchase</h2>
        <div class="po-subtitle">Order</div>
        <div class="po-number">${po.po_number}</div>
        <div class="status-pill">${status.label}</div>
      </div>
    </div>
  </div>

  <!-- Rainbow accent -->
  <div class="rainbow-line"></div>

  <!-- Body -->
  <div class="content">

    <!-- Meta Cards -->
    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label"><span class="meta-dot"></span> Supplier</div>
        <p>
          <strong>${po.suppliers?.name || "—"}</strong>
          ${po.suppliers?.contact_person ? `${po.suppliers.contact_person}<br>` : ""}
          ${po.suppliers?.email ? `${po.suppliers.email}<br>` : ""}
          ${po.suppliers?.phone ? `${po.suppliers.phone}<br>` : ""}
          ${po.suppliers?.address ? `${po.suppliers.address}<br>` : ""}
          ${po.suppliers?.city ? `${po.suppliers.city}${po.suppliers?.country ? `, ${po.suppliers.country}` : ""}` : ""}
        </p>
      </div>
      <div class="meta-card">
        <div class="meta-label"><span class="meta-dot"></span> Order Details</div>
        <p>
          <strong>${po.po_number}</strong>
          Date: ${poDate}<br>
          Currency: ${po.currency}<br>
          Items: ${items.length}
        </p>
      </div>
      <div class="meta-card">
        <div class="meta-label"><span class="meta-dot"></span> Delivery Info</div>
        <p>
          <strong>L&amp;M Medical Solutions</strong>
          Khartoum, Sudan<br>
          ${sentDate ? `Sent: ${sentDate}<br>` : ""}
          ${receivedDate ? `Received: ${receivedDate}` : "Awaiting delivery"}
        </p>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-header">
      <h3>Order Items</h3>
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%">#</th>
          <th style="width: 12%">Item Code</th>
          <th style="width: 30%">Product</th>
          <th style="text-align: right">Qty</th>
          <th style="text-align: right">Unit Cost (${po.currency})</th>
          <th style="text-align: right">Line Total (${po.currency})</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item: any, i: number) => `
          <tr>
            <td class="row-num">${String(i + 1).padStart(2, '0')}</td>
            <td><span class="item-code">${item.products?.item_code || "—"}</span></td>
            <td>
              <div class="item-name">${item.products?.item_name || "—"}</div>
              ${item.products?.variant ? `<span class="item-variant">${item.products.variant}</span>` : ""}
            </td>
            <td style="text-align: right; font-weight: 500">${item.quantity}</td>
            <td style="text-align: right">${item.unit_cost?.toLocaleString() || "—"}</td>
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
          <span class="value">${po.subtotal?.toLocaleString() || "0"} ${po.currency}</span>
        </div>
        <div class="grand-total">
          <span class="label">Total</span>
          <span class="value">${po.subtotal?.toLocaleString() || "0"} ${po.currency}</span>
        </div>
      </div>
    </div>

    ${po.status === "received" && receivedDate ? `
    <!-- Received Stamp -->
    <div class="received-stamp">
      <div class="received-check">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <div class="title">Goods Received</div>
      <div class="date">Received on ${receivedDate}</div>
    </div>
    ` : ""}

    ${po.notes ? `
    <!-- Notes -->
    <div class="notes">
      <h4>Notes</h4>
      <p>${po.notes}</p>
    </div>
    ` : ""}

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
        DOC ${po.id.substring(0, 8).toUpperCase()}<br>
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
    const supplier = po.suppliers;
    const items = po.purchase_order_items || [];
    const createdDate = new Date(po.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Header
    doc.setFontSize(20);
    doc.text("L&M Medical Solutions", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Orthopedic Implants & Surgical Systems", 20, 27);
    doc.text("Khartoum, Sudan | info@lmmedicalsolutions.org", 20, 32);

    // PO title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Purchase Order ${po.po_number}`, 20, 48);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Date: ${createdDate}`, 140, 48);
    doc.text(`Status: ${po.status.toUpperCase()}`, 140, 54);

    // Supplier info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Supplier:", 20, 58);
    doc.setTextColor(60);
    doc.text(supplier?.name || "—", 20, 64);
    if (supplier?.contact_person) doc.text(`Attn: ${supplier.contact_person}`, 20, 69);
    if (supplier?.email) doc.text(supplier.email, 20, 74);
    if (supplier?.phone) doc.text(supplier.phone, 20, 79);

    // Items table
    let y = 92;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, y - 5, 170, 8, "F");
    doc.setFontSize(8);
    doc.setTextColor(39, 57, 81);
    doc.text("ITEM CODE", 22, y);
    doc.text("PRODUCT", 52, y);
    doc.text("QTY", 120, y, { align: "right" });
    doc.text("UNIT COST", 150, y, { align: "right" });
    doc.text("TOTAL", 185, y, { align: "right" });
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(10, 22, 40);
    for (const item of items) {
      doc.text(item.products?.item_code || "—", 22, y);
      const name = `${item.products?.item_name || "—"}${item.products?.variant ? " — " + item.products.variant : ""}`;
      doc.text(name.substring(0, 40), 52, y);
      doc.text(String(item.quantity), 120, y, { align: "right" });
      doc.text(`${(item.unit_cost || 0).toLocaleString()}`, 150, y, { align: "right" });
      doc.text(`${(item.total || 0).toLocaleString()}`, 185, y, { align: "right" });
      y += 7;
      if (y > 260) { doc.addPage(); y = 20; }
    }

    y += 5;
    doc.setDrawColor(229, 237, 245);
    doc.line(120, y, 190, y);
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(26, 107, 181);
    doc.text("Subtotal:", 130, y);
    doc.text(`${(po.subtotal || 0).toLocaleString()} ${po.currency}`, 185, y, { align: "right" });

    if (po.notes) {
      y += 12;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Notes: ${po.notes}`, 20, y);
    }

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("L&M Medical Solutions — Premium Orthopedic Implants & Surgical Supplies", 105, 280, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="PO-${po.po_number}.pdf"`,
      },
    });
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
