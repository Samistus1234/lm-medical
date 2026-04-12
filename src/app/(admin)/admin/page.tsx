import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/stats-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { DashboardCharts } from "./dashboard-charts";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // KPI queries
  const [
    { count: productCount },
    { count: customerCount },
    { count: quoteCount },
    { count: orderCount },
    { count: purchaseOrderCount },
    { data: lowStockProducts },
    { data: pendingQuotes },
    { data: recentOrders },
    { data: pipelineDeals },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("quotes").select("*", { count: "exact", head: true }).in("status", ["pending", "reviewed", "quoted"]),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["confirmed", "processing", "shipped"]),
    supabase.from("purchase_orders").select("*", { count: "exact", head: true }).in("status", ["draft", "sent", "confirmed"]),
    supabase.from("products").select("id, item_code, item_name, stock_qty").eq("is_active", true).lte("stock_qty", 5).order("stock_qty").limit(10),
    supabase.from("quotes").select("id, quote_number, contact_name, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("id, order_number, status, total, currency, created_at, customers(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("pipeline_deals").select("stage"),
    supabase.from("activity_log").select("id, action, entity_type, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  // Pipeline summary
  const pipelineSummary = ["lead", "contacted", "proposal", "negotiation", "won", "lost"].map((stage) => ({
    stage,
    count: pipelineDeals?.filter((d) => d.stage === stage).length || 0,
  }));

  // ── Chart data queries ──────────────────────────────────────────
  const [
    { data: allProducts },
    { data: allOrders },
    { data: allQuotes },
    { data: paidInvoices },
    { data: orderItemsWithProducts },
    { data: productsWithSuppliers },
  ] = await Promise.all([
    supabase.from("products").select("category, stock_qty").eq("is_active", true),
    supabase.from("orders").select("status"),
    supabase.from("quotes").select("status, id"),
    supabase.from("invoices").select("total, paid_at").eq("status", "paid"),
    supabase.from("order_items").select("quantity, product_id, products(item_name)"),
    supabase.from("products").select("supplier_id, suppliers(name)").eq("is_active", true).not("supplier_id", "is", null),
  ]);

  // 1. Stock by category
  const categoryMap = new Map<string, { healthy: number; low: number; out: number }>();
  (allProducts || []).forEach((p) => {
    const entry = categoryMap.get(p.category) || { healthy: 0, low: 0, out: 0 };
    if (p.stock_qty === 0) entry.out++;
    else if (p.stock_qty <= 10) entry.low++;
    else entry.healthy++;
    categoryMap.set(p.category, entry);
  });
  const stockByCategory = Array.from(categoryMap.entries())
    .map(([category, counts]) => ({ category, ...counts }))
    .sort((a, b) => (b.healthy + b.low + b.out) - (a.healthy + a.low + a.out));

  // 2. Orders by status
  const orderStatusMap = new Map<string, number>();
  (allOrders || []).forEach((o) => {
    orderStatusMap.set(o.status, (orderStatusMap.get(o.status) || 0) + 1);
  });
  const ordersByStatus = ["confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => ({
    status: s,
    count: orderStatusMap.get(s) || 0,
  }));

  // 3. Quote funnel
  const totalQuotes = allQuotes?.length || 0;
  const acceptedQuotes = allQuotes?.filter((q) => q.status === "accepted").length || 0;
  // Count quotes that have been converted to orders (by checking orders with quote_id)
  const { count: convertedCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).not("quote_id", "is", null);
  const quoteFunnel = { total: totalQuotes, accepted: acceptedQuotes, converted: convertedCount || 0 };

  // 4. Monthly revenue (last 6 months)
  const now = new Date();
  const monthlyRevenue: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString("en-US", { month: "short" });
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const amount = (paidInvoices || [])
      .filter((inv) => {
        if (!inv.paid_at) return false;
        const paid = new Date(inv.paid_at);
        return paid >= d && paid < nextMonth;
      })
      .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    monthlyRevenue.push({ month: monthLabel, amount });
  }

  // 5. Top products by order quantity
  const productQtyMap = new Map<string, number>();
  (orderItemsWithProducts || []).forEach((item: any) => {
    const name = item.products?.item_name || "Unknown";
    productQtyMap.set(name, (productQtyMap.get(name) || 0) + (item.quantity || 0));
  });
  const topProducts = Array.from(productQtyMap.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 6. Supplier distribution
  const supplierMap = new Map<string, number>();
  (productsWithSuppliers || []).forEach((p: any) => {
    const name = p.suppliers?.name || "Unknown";
    supplierMap.set(name, (supplierMap.get(name) || 0) + 1);
  });
  const supplierDistribution = Array.from(supplierMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard label="Active Products" value={productCount || 0} />
        <StatsCard label="Customers" value={customerCount || 0} />
        <StatsCard label="Active Quotes" value={quoteCount || 0} subtitle="Pending, reviewed, or quoted" />
        <StatsCard label="Active Orders" value={orderCount || 0} subtitle="Confirmed, processing, or shipped" />
        <StatsCard label="Purchase Orders" value={purchaseOrderCount || 0} subtitle="Draft, sent, or confirmed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Quotes */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-normal" style={{ color: "#273951" }}>Pending Quotes</h3>
            <Link href="/admin/quotes" className="text-xs" style={{ color: "#1a6bb5" }}>View all</Link>
          </div>
          {pendingQuotes && pendingQuotes.length > 0 ? pendingQuotes.map((q) => (
            <Link key={q.id} href={`/admin/quotes/${q.id}`} className="flex items-center justify-between py-2 hover:bg-[#f8fafc] px-2 rounded-[4px]" style={{ borderBottom: "1px solid #f8fafc" }}>
              <div>
                <span className="text-sm" style={{ color: "#0a1628" }}>{q.quote_number}</span>
                <span className="text-xs ml-2" style={{ color: "#64748d" }}>{q.contact_name}</span>
              </div>
              <span className="text-xs" style={{ color: "#94a3b8" }}>{new Date(q.created_at).toLocaleDateString()}</span>
            </Link>
          )) : <p className="text-sm py-4" style={{ color: "#64748d" }}>No pending quotes</p>}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-normal" style={{ color: "#273951" }}>Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs" style={{ color: "#1a6bb5" }}>View all</Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? recentOrders.map((o: any) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-2 hover:bg-[#f8fafc] px-2 rounded-[4px]" style={{ borderBottom: "1px solid #f8fafc" }}>
              <div>
                <span className="text-sm" style={{ color: "#0a1628" }}>{o.order_number}</span>
                <span className="text-xs ml-2" style={{ color: "#64748d" }}>{o.customers?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#0a1628" }}>{o.total?.toLocaleString()} {o.currency}</span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          )) : <p className="text-sm py-4" style={{ color: "#64748d" }}>No orders yet</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Summary */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-normal" style={{ color: "#273951" }}>Pipeline</h3>
            <Link href="/admin/pipeline" className="text-xs" style={{ color: "#1a6bb5" }}>View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {pipelineSummary.map((s) => (
              <div key={s.stage} className="text-center p-3 rounded-[4px]" style={{ backgroundColor: "#f8fafc" }}>
                <p className="text-xl font-light" style={{ color: "#0a1628" }}>{s.count}</p>
                <p className="text-xs capitalize" style={{ color: "#64748d" }}>{s.stage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-normal" style={{ color: "#273951" }}>Low Stock Alerts</h3>
            <div className="flex items-center gap-3">
              <Link href="/admin/purchase-orders/new" className="text-xs px-2 py-1 rounded-[4px] text-white" style={{ backgroundColor: "#1a6bb5" }}>Create Purchase Order</Link>
              <Link href="/admin/inventory" className="text-xs" style={{ color: "#1a6bb5" }}>View all</Link>
            </div>
          </div>
          {lowStockProducts && lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #f8fafc" }}>
              <div>
                <span className="text-sm" style={{ color: "#0a1628" }}>{p.item_name}</span>
                <span className="text-xs ml-2 font-mono" style={{ color: "#94a3b8" }}>{p.item_code}</span>
              </div>
              <span className="text-sm font-normal" style={{ color: p.stock_qty === 0 ? "#ea2261" : "#9b6829" }}>
                {p.stock_qty} left
              </span>
            </div>
          )) : <p className="text-sm py-4" style={{ color: "#64748d" }}>All products well stocked</p>}
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        stockByCategory={stockByCategory}
        ordersByStatus={ordersByStatus}
        quoteFunnel={quoteFunnel}
        monthlyRevenue={monthlyRevenue}
        topProducts={topProducts}
        supplierDistribution={supplierDistribution}
      />
    </div>
  );
}
