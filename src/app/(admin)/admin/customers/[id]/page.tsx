import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).single();
  if (!customer) notFound();

  const { data: quotes } = await supabase.from("quotes").select("id, quote_number, status, total_amount, created_at").eq("customer_id", id).order("created_at", { ascending: false });
  const { data: orders } = await supabase.from("orders").select("id, order_number, status, total, created_at").eq("customer_id", id).order("created_at", { ascending: false });

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#64748d" }}>
        <Link href="/admin/customers" className="hover:text-[#1a6bb5]">Customers</Link>
        <span>/</span>
        <span style={{ color: "#0a1628" }}>{customer.name}</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>{customer.name}</h1>
        <StatusBadge status={customer.type} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Contact Information</h3>
          {[
            { label: "Contact Person", value: customer.contact_person },
            { label: "Email", value: customer.email },
            { label: "Phone", value: customer.phone },
            { label: "Address", value: customer.address },
            { label: "City", value: customer.city },
            { label: "Country", value: customer.country },
          ].map((f) => (
            <div key={f.label} className="mb-3">
              <p className="text-xs" style={{ color: "#94a3b8" }}>{f.label}</p>
              <p className="text-sm" style={{ color: "#0a1628" }}>{f.value || "—"}</p>
            </div>
          ))}
          {customer.notes && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #e5edf5" }}>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Notes</p>
              <p className="text-sm mt-1" style={{ color: "#0a1628" }}>{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Quotes */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Quotes ({quotes?.length || 0})</h3>
          {quotes && quotes.length > 0 ? quotes.map((q) => (
            <Link key={q.id} href={`/admin/quotes/${q.id}`} className="block mb-3 p-3 rounded-[4px] hover:bg-[#f8fafc]" style={{ border: "1px solid #e5edf5" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "#0a1628" }}>{q.quote_number}</span>
                <StatusBadge status={q.status} />
              </div>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{new Date(q.created_at).toLocaleDateString()}</p>
            </Link>
          )) : <p className="text-sm" style={{ color: "#64748d" }}>No quotes yet</p>}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Orders ({orders?.length || 0})</h3>
          {orders && orders.length > 0 ? orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block mb-3 p-3 rounded-[4px] hover:bg-[#f8fafc]" style={{ border: "1px solid #e5edf5" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "#0a1628" }}>{o.order_number}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{o.total?.toLocaleString()} • {new Date(o.created_at).toLocaleDateString()}</p>
            </Link>
          )) : <p className="text-sm" style={{ color: "#64748d" }}>No orders yet</p>}
        </div>
      </div>
    </div>
  );
}
