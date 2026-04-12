"use client";

/* ── Types ─────────────────────────────────────────────────────────── */

interface StockByCategory {
  category: string;
  healthy: number;
  low: number;
  out: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface QuoteFunnel {
  total: number;
  accepted: number;
  converted: number;
}

interface MonthlyRevenue {
  month: string;
  amount: number;
}

interface TopProduct {
  name: string;
  qty: number;
}

interface SupplierSlice {
  name: string;
  count: number;
}

interface DashboardChartsProps {
  stockByCategory: StockByCategory[];
  ordersByStatus: OrdersByStatus[];
  quoteFunnel: QuoteFunnel;
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
  supplierDistribution: SupplierSlice[];
}

/* ── Palette ───────────────────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#1a6bb5",
  processing: "#2a8fd4",
  shipped: "#f59e0b",
  delivered: "#10b981",
  cancelled: "#ea2261",
};

const PIE_COLORS = ["#1a6bb5", "#2a8fd4", "#10b981", "#f59e0b", "#ea2261", "#64748d", "#7c3aed", "#06b6d4"];

/* ── Helpers ───────────────────────────────────────────────────────── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
      <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>{title}</h3>
      {children}
    </div>
  );
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/* ── 1. Stock Distribution Bar Chart ──────────────────────────────── */

function StockDistributionChart({ data }: { data: StockByCategory[] }) {
  if (!data.length) return <p className="text-sm" style={{ color: "#64748d" }}>No product data</p>;

  const maxTotal = Math.max(...data.map((d) => d.healthy + d.low + d.out), 1);

  return (
    <div className="space-y-3">
      {data.map((cat) => {
        const total = cat.healthy + cat.low + cat.out;
        const barWidth = (total / maxTotal) * 100;
        const hPct = total ? (cat.healthy / total) * 100 : 0;
        const lPct = total ? (cat.low / total) * 100 : 0;
        return (
          <div key={cat.category}>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: "#0a1628" }}>{cat.category}</span>
              <span className="text-xs font-mono" style={{ color: "#64748d" }}>{total}</span>
            </div>
            <div className="w-full h-5 rounded-[3px] overflow-hidden" style={{ backgroundColor: "#f1f5f9" }}>
              <div className="h-full flex" style={{ width: `${barWidth}%` }}>
                {cat.healthy > 0 && <div style={{ width: `${hPct}%`, backgroundColor: "#10b981" }} />}
                {cat.low > 0 && <div style={{ width: `${lPct}%`, backgroundColor: "#f59e0b" }} />}
                {cat.out > 0 && <div style={{ width: `${100 - hPct - lPct}%`, backgroundColor: "#ea2261" }} />}
              </div>
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div className="flex gap-4 pt-2">
        {[
          { label: "Healthy (>10)", color: "#10b981" },
          { label: "Low (1-10)", color: "#f59e0b" },
          { label: "Out of Stock", color: "#ea2261" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[10px]" style={{ color: "#64748d" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 2. Order Status Donut Chart ──────────────────────────────────── */

function OrderStatusDonut({ data }: { data: OrdersByStatus[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return <p className="text-sm" style={{ color: "#64748d" }}>No orders yet</p>;

  const radius = 60;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.filter((d) => d.count > 0).map((d) => {
          const pct = d.count / total;
          const dashLen = pct * circumference;
          const dashOff = -offset * circumference;
          offset += pct;
          return (
            <circle
              key={d.status}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={STATUS_COLORS[d.status] || "#64748d"}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOff}
              transform="rotate(-90 80 80)"
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="20" fontWeight="300" fill="#0a1628">{total}</text>
        <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#64748d">orders</text>
      </svg>
      <div className="space-y-2">
        {data.filter((d) => d.count > 0).map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.status] || "#64748d" }} />
            <span className="text-xs capitalize" style={{ color: "#0a1628" }}>{d.status}</span>
            <span className="text-xs font-mono" style={{ color: "#64748d" }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 3. Quote Conversion Funnel ───────────────────────────────────── */

function QuoteConversionFunnel({ data }: { data: QuoteFunnel }) {
  const { total, accepted, converted } = data;
  if (!total) return <p className="text-sm" style={{ color: "#64748d" }}>No quotes yet</p>;

  const steps = [
    { label: "Total Quotes", value: total, color: "#1a6bb5" },
    { label: "Accepted", value: accepted, color: "#2a8fd4" },
    { label: "Converted to Orders", value: converted, color: "#10b981" },
  ];

  const acceptRate = total ? ((accepted / total) * 100).toFixed(1) : "0";
  const convertRate = accepted ? ((converted / accepted) * 100).toFixed(1) : "0";

  return (
    <div>
      <div className="space-y-3 mb-4">
        {steps.map((step, i) => {
          const widthPct = total ? Math.max((step.value / total) * 100, 8) : 8;
          return (
            <div key={step.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: "#0a1628" }}>{step.label}</span>
                <span className="text-xs font-mono" style={{ color: "#64748d" }}>{step.value}</span>
              </div>
              <div className="w-full h-7 rounded-[3px]" style={{ backgroundColor: "#f1f5f9" }}>
                <div
                  className="h-full rounded-[3px] flex items-center justify-end pr-2"
                  style={{ width: `${widthPct}%`, backgroundColor: step.color, transition: "width 0.6s" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-lg font-light" style={{ color: "#1a6bb5" }}>{acceptRate}%</p>
          <p className="text-[10px]" style={{ color: "#64748d" }}>Accept Rate</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-light" style={{ color: "#10b981" }}>{convertRate}%</p>
          <p className="text-[10px]" style={{ color: "#64748d" }}>Conversion Rate</p>
        </div>
      </div>
    </div>
  );
}

/* ── 4. Monthly Revenue Chart ─────────────────────────────────────── */

function MonthlyRevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const hasData = data.some((d) => d.amount > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="28" width="8" height="12" rx="2" fill="#e5edf5" />
          <rect x="16" y="20" width="8" height="20" rx="2" fill="#e5edf5" />
          <rect x="28" y="12" width="8" height="28" rx="2" fill="#e5edf5" />
          <line x1="2" y1="42" x2="46" y2="42" stroke="#e5edf5" strokeWidth="2" />
        </svg>
        <p className="text-xs mt-2" style={{ color: "#64748d" }}>No paid invoices yet</p>
      </div>
    );
  }

  const barW = 36;
  const gap = 12;
  const chartH = 140;
  const chartW = data.length * (barW + gap);

  return (
    <div className="overflow-x-auto">
      <svg width={chartW + 20} height={chartH + 36} viewBox={`0 0 ${chartW + 20} ${chartH + 36}`}>
        {data.map((d, i) => {
          const barH = Math.max((d.amount / maxVal) * chartH, 2);
          const x = 10 + i * (barW + gap);
          const y = chartH - barH;
          return (
            <g key={d.month}>
              <rect x={x} y={y} width={barW} height={barH} rx={3} fill="#1a6bb5" opacity={0.85} />
              {d.amount > 0 && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fill="#64748d">
                  {formatCurrency(d.amount)}
                </text>
              )}
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize="10" fill="#64748d">
                {d.month}
              </text>
            </g>
          );
        })}
        <line x1="8" y1={chartH} x2={chartW + 12} y2={chartH} stroke="#e5edf5" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ── 5. Top Products by Orders ────────────────────────────────────── */

function TopProductsChart({ data }: { data: TopProduct[] }) {
  if (!data.length) return <p className="text-sm" style={{ color: "#64748d" }}>No order data</p>;

  const maxQty = Math.max(...data.map((d) => d.qty), 1);

  return (
    <div className="space-y-3">
      {data.map((p, i) => {
        const widthPct = (p.qty / maxQty) * 100;
        return (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-xs truncate max-w-[180px]" style={{ color: "#0a1628" }}>{p.name}</span>
              <span className="text-xs font-mono" style={{ color: "#64748d" }}>{p.qty} units</span>
            </div>
            <div className="w-full h-4 rounded-[3px]" style={{ backgroundColor: "#f1f5f9" }}>
              <div
                className="h-full rounded-[3px]"
                style={{ width: `${widthPct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 6. Supplier Distribution Pie Chart ───────────────────────────── */

function SupplierDistributionChart({ data }: { data: SupplierSlice[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (!total) return <p className="text-sm" style={{ color: "#64748d" }}>No supplier data</p>;

  const radius = 60;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((d, i) => {
          const pct = d.count / total;
          const dashLen = pct * circumference;
          const dashOff = -offset * circumference;
          offset += pct;
          return (
            <circle
              key={d.name}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={PIE_COLORS[i % PIE_COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOff}
              transform="rotate(-90 80 80)"
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="20" fontWeight="300" fill="#0a1628">{total}</text>
        <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#64748d">products</text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-xs truncate max-w-[120px]" style={{ color: "#0a1628" }}>{d.name}</span>
            <span className="text-xs font-mono" style={{ color: "#64748d" }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */

export function DashboardCharts({
  stockByCategory,
  ordersByStatus,
  quoteFunnel,
  monthlyRevenue,
  topProducts,
  supplierDistribution,
}: DashboardChartsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-light mb-4" style={{ color: "#0a1628", letterSpacing: "-0.32px" }}>Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Stock Distribution by Category">
          <StockDistributionChart data={stockByCategory} />
        </Card>
        <Card title="Order Status Breakdown">
          <OrderStatusDonut data={ordersByStatus} />
        </Card>
        <Card title="Quote Conversion Funnel">
          <QuoteConversionFunnel data={quoteFunnel} />
        </Card>
        <Card title="Monthly Revenue (Paid Invoices)">
          <MonthlyRevenueChart data={monthlyRevenue} />
        </Card>
        <Card title="Top Products by Orders">
          <TopProductsChart data={topProducts} />
        </Card>
        <Card title="Supplier Distribution">
          <SupplierDistributionChart data={supplierDistribution} />
        </Card>
      </div>
    </div>
  );
}
