"use client";

import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────────── */

interface OutstandingInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  total: number;
  currency: string;
  due_date: string;
  status: string;
}

interface MonthlyFinancial {
  month: string;
  revenue: number;
  costs: number;
}

interface InvoiceStatusBreakdown {
  paid: number;
  sent: number;
  overdue: number;
  draft: number;
}

export interface DashboardFinancialsProps {
  totalRevenue: number;
  outstanding: number;
  purchaseCosts: number;
  grossProfit: number;
  monthlyFinancials: MonthlyFinancial[];
  outstandingInvoices: OutstandingInvoice[];
  invoiceStatusBreakdown: InvoiceStatusBreakdown;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function formatUSD(n: number) {
  return `USD ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

function daysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/* ── Revenue Cards ─────────────────────────────────────────────────── */

function RevenueCards({
  totalRevenue,
  outstanding,
  purchaseCosts,
  grossProfit,
}: {
  totalRevenue: number;
  outstanding: number;
  purchaseCosts: number;
  grossProfit: number;
}) {
  const cards = [
    {
      label: "Total Revenue",
      value: totalRevenue,
      color: "#1a6bb5",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Outstanding",
      value: outstanding,
      color: "#f59e0b",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Purchase Costs",
      value: purchaseCosts,
      color: "#64748d",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      label: "Gross Profit",
      value: grossProfit,
      color: grossProfit >= 0 ? "#10b981" : "#ea2261",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={grossProfit >= 0 ? "#10b981" : "#ea2261"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={grossProfit >= 0 ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"} />
          <polyline points={grossProfit >= 0 ? "17 6 23 6 23 12" : "17 18 23 18 23 12"} />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-[6px] p-5 transition-all duration-200 hover:shadow-md"
          style={{ border: "1px solid #e5edf5", borderLeft: `3px solid ${card.color}` }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-normal" style={{ color: "#64748d" }}>
              {card.label}
            </span>
            <span style={{ opacity: 0.6 }}>{card.icon}</span>
          </div>
          <p className="text-2xl font-light" style={{ color: card.color }}>
            USD {formatCompact(card.value)}
          </p>
          <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>
            {formatUSD(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Revenue vs Costs Bar Chart ────────────────────────────────────── */

function RevenueCostsChart({ data }: { data: MonthlyFinancial[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.costs)), 1);
  const hasData = data.some((d) => d.revenue > 0 || d.costs > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="28" width="6" height="12" rx="2" fill="#10b981" opacity="0.3" />
          <rect x="12" y="32" width="6" height="8" rx="2" fill="#ea2261" opacity="0.3" />
          <rect x="22" y="20" width="6" height="20" rx="2" fill="#10b981" opacity="0.3" />
          <rect x="30" y="26" width="6" height="14" rx="2" fill="#ea2261" opacity="0.3" />
          <line x1="2" y1="42" x2="46" y2="42" stroke="#e5edf5" strokeWidth="2" />
        </svg>
        <p className="text-xs mt-2" style={{ color: "#64748d" }}>No financial data yet</p>
      </div>
    );
  }

  const barW = 24;
  const pairGap = 4;
  const groupGap = 20;
  const chartH = 140;
  const groupW = barW * 2 + pairGap;
  const chartW = data.length * (groupW + groupGap);

  return (
    <div className="overflow-x-auto">
      <svg width={chartW + 20} height={chartH + 36} viewBox={`0 0 ${chartW + 20} ${chartH + 36}`}>
        {data.map((d, i) => {
          const gx = 10 + i * (groupW + groupGap);
          const revH = Math.max((d.revenue / maxVal) * chartH, 2);
          const costH = Math.max((d.costs / maxVal) * chartH, 2);
          return (
            <g key={d.month}>
              {/* Revenue bar */}
              <rect
                x={gx}
                y={chartH - revH}
                width={barW}
                height={revH}
                rx={3}
                fill="#10b981"
                opacity={0.85}
              />
              {d.revenue > 0 && (
                <text x={gx + barW / 2} y={chartH - revH - 4} textAnchor="middle" fontSize="8" fill="#10b981">
                  {formatCompact(d.revenue)}
                </text>
              )}
              {/* Cost bar */}
              <rect
                x={gx + barW + pairGap}
                y={chartH - costH}
                width={barW}
                height={costH}
                rx={3}
                fill="#f59e0b"
                opacity={0.85}
              />
              {d.costs > 0 && (
                <text x={gx + barW + pairGap + barW / 2} y={chartH - costH - 4} textAnchor="middle" fontSize="8" fill="#f59e0b">
                  {formatCompact(d.costs)}
                </text>
              )}
              {/* Month label */}
              <text x={gx + groupW / 2} y={chartH + 14} textAnchor="middle" fontSize="10" fill="#64748d">
                {d.month}
              </text>
            </g>
          );
        })}
        <line x1="8" y1={chartH} x2={chartW + 12} y2={chartH} stroke="#e5edf5" strokeWidth="1" />
      </svg>
      {/* Legend */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }} />
          <span className="text-[10px]" style={{ color: "#64748d" }}>Revenue</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          <span className="text-[10px]" style={{ color: "#64748d" }}>Costs</span>
        </div>
      </div>
    </div>
  );
}

/* ── Outstanding Invoices Table ────────────────────────────────────── */

function OutstandingInvoicesTable({ invoices }: { invoices: OutstandingInvoice[] }) {
  if (!invoices.length) {
    return <p className="text-sm py-4" style={{ color: "#64748d" }}>No outstanding invoices</p>;
  }

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid #e5edf5" }}>
            {["Invoice #", "Customer", "Amount", "Due Date", "Status"].map((h) => (
              <th key={h} className="text-left text-[10px] font-normal py-2 px-1" style={{ color: "#94a3b8" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const overdueDays = inv.status === "overdue" ? daysOverdue(inv.due_date) : 0;
            return (
              <tr key={inv.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td className="py-2 px-1">
                  <Link href={`/admin/invoices/${inv.id}`} className="text-xs" style={{ color: "#1a6bb5" }}>
                    {inv.invoice_number}
                  </Link>
                </td>
                <td className="text-xs py-2 px-1" style={{ color: "#0a1628" }}>
                  {inv.customer_name}
                </td>
                <td className="text-xs font-mono py-2 px-1" style={{ color: "#0a1628" }}>
                  {formatUSD(inv.total)}
                </td>
                <td className="text-xs py-2 px-1" style={{ color: "#64748d" }}>
                  {new Date(inv.due_date).toLocaleDateString()}
                </td>
                <td className="text-xs py-2 px-1">
                  {inv.status === "overdue" ? (
                    <span style={{ color: "#ea2261" }}>{overdueDays}d overdue</span>
                  ) : (
                    <span style={{ color: "#1a6bb5" }}>Sent</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Payment Status Donut ──────────────────────────────────────────── */

function PaymentStatusDonut({ data }: { data: InvoiceStatusBreakdown }) {
  const total = data.paid + data.sent + data.overdue + data.draft;
  if (!total) return <p className="text-sm" style={{ color: "#64748d" }}>No invoices yet</p>;

  const slices = [
    { label: "Paid", count: data.paid, color: "#10b981" },
    { label: "Sent / Pending", count: data.sent, color: "#1a6bb5" },
    { label: "Overdue", count: data.overdue, color: "#ea2261" },
    { label: "Draft", count: data.draft, color: "#94a3b8" },
  ].filter((s) => s.count > 0);

  const radius = 60;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map((s) => {
          const pct = s.count / total;
          const dashLen = pct * circumference;
          const dashOff = -offset * circumference;
          offset += pct;
          return (
            <circle
              key={s.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOff}
              transform="rotate(-90 80 80)"
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="20" fontWeight="300" fill="#0a1628">
          {total}
        </text>
        <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#64748d">
          invoices
        </text>
      </svg>
      <div className="space-y-2">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs" style={{ color: "#0a1628" }}>{s.label}</span>
            <span className="text-xs font-mono" style={{ color: "#64748d" }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */

export function DashboardFinancials({
  totalRevenue,
  outstanding,
  purchaseCosts,
  grossProfit,
  monthlyFinancials,
  outstandingInvoices,
  invoiceStatusBreakdown,
}: DashboardFinancialsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-light mb-4 flex items-center gap-2" style={{ color: "#0a1628", letterSpacing: "-0.32px" }}>
        <span className="w-1 h-6 rounded-full inline-block" style={{ backgroundColor: "#10b981" }} />
        Financials Overview
      </h2>

      {/* Revenue Cards */}
      <RevenueCards
        totalRevenue={totalRevenue}
        outstanding={outstanding}
        purchaseCosts={purchaseCosts}
        grossProfit={grossProfit}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue vs Costs */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5", borderTop: "3px solid #10b981" }}>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: "#273951" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#10b981" }} />
            Revenue vs Costs (Last 6 Months)
          </h3>
          <RevenueCostsChart data={monthlyFinancials} />
        </div>

        {/* Payment Status Donut */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5", borderTop: "3px solid #1a6bb5" }}>
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: "#273951" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#1a6bb5" }} />
            Payment Status
          </h3>
          <PaymentStatusDonut data={invoiceStatusBreakdown} />
        </div>
      </div>

      {/* Outstanding Invoices Table */}
      <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5", borderTop: "3px solid #f59e0b" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: "#273951" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#f59e0b" }} />
            Outstanding Invoices
          </h3>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/invoices?new=1"
              className="text-xs px-2 py-1 rounded-[4px] text-white"
              style={{ backgroundColor: "#1a6bb5" }}
            >
              + New Invoice
            </Link>
            <Link href="/admin/invoices" className="text-xs" style={{ color: "#1a6bb5" }}>
              View all
            </Link>
          </div>
        </div>
        <OutstandingInvoicesTable invoices={outstandingInvoices} />
      </div>
    </div>
  );
}
