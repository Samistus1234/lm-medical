"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateInvoiceStatus } from "./actions";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("invoices").select("*, customers(name), orders(order_number)")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setInvoices(data || []); setLoading(false); });
  }, []);

  async function handleStatusChange(id: string, status: string) {
    await updateInvoiceStatus(id, status);
    // Refresh
    const supabase = createClient();
    const { data } = await supabase.from("invoices").select("*, customers(name), orders(order_number)").order("created_at", { ascending: false });
    setInvoices(data || []);
  }

  if (loading) return <div className="py-16 text-center" style={{ color: "#64748d" }}>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Invoices</h1>
      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Invoice #", "Order", "Customer", "Status", "Total", "Due Date", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-3 font-mono text-sm" style={{ color: "#1a6bb5" }}>{inv.invoice_number}</td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{inv.orders?.order_number || "—"}</td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>{inv.customers?.name || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>{inv.total?.toLocaleString()} {inv.currency}</td>
                <td className="px-4 py-3" style={{ color: "#94a3b8" }}>{new Date(inv.due_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" className="text-xs px-2 py-1 rounded-[4px] mr-1" style={{ color: "#1a6bb5", border: "1px solid #e5edf5" }}>PDF</a>
                  {inv.status === "draft" && <button onClick={() => handleStatusChange(inv.id, "sent")} className="text-xs px-2 py-1 text-white rounded-[4px] mr-1" style={{ backgroundColor: "#1a6bb5" }}>Send</button>}
                  {inv.status === "sent" && <button onClick={() => handleStatusChange(inv.id, "paid")} className="text-xs px-2 py-1 text-white rounded-[4px]" style={{ backgroundColor: "#15be53" }}>Mark Paid</button>}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#64748d" }}>No invoices yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
