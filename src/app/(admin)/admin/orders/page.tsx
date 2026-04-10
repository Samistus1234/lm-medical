import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, customers(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Orders</h1>
      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Order #", "Customer", "Status", "Total", "Date"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o.id} className="hover:bg-[#f8fafc]" style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-sm" style={{ color: "#1a6bb5" }}>{o.order_number}</Link></td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>{o.customers?.name || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>{o.total?.toLocaleString()} {o.currency}</td>
                <td className="px-4 py-3" style={{ color: "#94a3b8" }}>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#64748d" }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
