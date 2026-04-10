import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderActions } from "./order-actions";

interface PageProps { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders")
    .select("*, customers(name, email, phone), order_items(*, products(item_code, item_name, variant))")
    .eq("id", id).single();
  if (!order) notFound();

  const { data: invoice } = await supabase.from("invoices").select("id, invoice_number, status").eq("order_id", id).maybeSingle();

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#64748d" }}>
        <Link href="/admin/orders" className="hover:text-[#1a6bb5]">Orders</Link>
        <span>/</span><span style={{ color: "#0a1628" }}>{order.order_number}</span>
      </nav>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Customer</h3>
          <p style={{ color: "#0a1628" }}>{order.customers?.name}</p>
          <p className="text-sm" style={{ color: "#64748d" }}>{order.customers?.email}</p>
          {order.customers?.phone && <p className="text-sm" style={{ color: "#64748d" }}>{order.customers.phone}</p>}
        </div>
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Summary</h3>
          <p className="text-sm" style={{ color: "#64748d" }}>Subtotal: <span style={{ color: "#0a1628" }}>{order.subtotal?.toLocaleString()}</span></p>
          <p className="text-sm" style={{ color: "#64748d" }}>Discount: <span style={{ color: "#0a1628" }}>{order.discount?.toLocaleString()}</span></p>
          <p className="text-sm font-normal" style={{ color: "#0a1628" }}>Total: {order.total?.toLocaleString()} {order.currency}</p>
        </div>
        <OrderActions orderId={order.id} status={order.status} invoice={invoice} />
      </div>

      <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
        <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Items</h3>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Product", "Variant", "Qty", "Unit Price", "Total"].map((h) => (
                <th key={h} className="text-left px-4 py-2 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((oi: any) => (
              <tr key={oi.id} style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>{oi.products?.item_name}<br/><span className="text-xs" style={{ color: "#94a3b8" }}>{oi.products?.item_code}</span></td>
                <td className="px-4 py-2" style={{ color: "#64748d" }}>{oi.products?.variant || "—"}</td>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>{oi.quantity}</td>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>{oi.unit_price?.toLocaleString()}</td>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>{oi.total?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
