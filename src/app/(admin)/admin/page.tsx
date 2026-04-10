import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/stats-card";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // KPI queries
  const [
    { count: productCount },
    { count: customerCount },
    { count: quoteCount },
    { count: orderCount },
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

  return (
    <div>
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Active Products" value={productCount || 0} />
        <StatsCard label="Customers" value={customerCount || 0} />
        <StatsCard label="Active Quotes" value={quoteCount || 0} subtitle="Pending, reviewed, or quoted" />
        <StatsCard label="Active Orders" value={orderCount || 0} subtitle="Confirmed, processing, or shipped" />
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
            <Link href="/admin/inventory" className="text-xs" style={{ color: "#1a6bb5" }}>View all</Link>
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
    </div>
  );
}
