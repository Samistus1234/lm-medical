"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateQuoteStatus, updateQuoteItemPrice, updateQuoteTotalAndNotes, convertQuoteToOrder } from "../actions";

interface QuoteDetailProps {
  quote: any;
}

export function QuoteDetail({ quote }: QuoteDetailProps) {
  const router = useRouter();
  const [internalNotes, setInternalNotes] = useState(quote.internal_notes || "");
  const [converting, setConverting] = useState(false);

  const statusFlow: Record<string, string[]> = {
    pending: ["reviewed"],
    reviewed: ["quoted"],
    quoted: ["accepted", "rejected"],
    accepted: [],
    rejected: [],
    expired: [],
  };

  const nextStatuses = statusFlow[quote.status] || [];

  async function handleStatusChange(status: string) {
    await updateQuoteStatus(quote.id, status);
    router.refresh();
  }

  async function handleConvert() {
    setConverting(true);
    const result = await convertQuoteToOrder(quote.id);
    if (result.success) {
      router.push("/admin/orders");
    }
    setConverting(false);
  }

  async function handleSaveNotes() {
    const total = quote.quote_items?.reduce((sum: number, qi: any) => sum + (qi.total || 0), 0) || 0;
    await updateQuoteTotalAndNotes(quote.id, total, internalNotes || null);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>{quote.quote_number}</h1>
        <StatusBadge status={quote.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Contact</h3>
          <p className="text-sm" style={{ color: "#0a1628" }}>{quote.contact_name}</p>
          <p className="text-sm" style={{ color: "#64748d" }}>{quote.contact_email}</p>
          {quote.contact_phone && <p className="text-sm" style={{ color: "#64748d" }}>{quote.contact_phone}</p>}
          {quote.organization && <p className="text-sm mt-2" style={{ color: "#64748d" }}>{quote.organization}</p>}
        </div>

        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Details</h3>
          <p className="text-sm" style={{ color: "#64748d" }}>Currency: <span style={{ color: "#0a1628" }}>{quote.currency}</span></p>
          <p className="text-sm" style={{ color: "#64748d" }}>Items: <span style={{ color: "#0a1628" }}>{quote.quote_items?.length || 0}</span></p>
          <p className="text-sm" style={{ color: "#64748d" }}>Date: <span style={{ color: "#0a1628" }}>{new Date(quote.created_at).toLocaleDateString()}</span></p>
          {quote.notes && <p className="text-sm mt-2" style={{ color: "#64748d" }}>Notes: {quote.notes}</p>}
        </div>

        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Actions</h3>
          <div className="space-y-2">
            {nextStatuses.map((s) => (
              <button key={s} onClick={() => handleStatusChange(s)} className="block w-full py-2 text-sm text-white rounded-[4px] capitalize" style={{ backgroundColor: "#1a6bb5" }}>
                Mark as {s}
              </button>
            ))}
            {quote.status === "accepted" && (
              <button onClick={handleConvert} disabled={converting} className="block w-full py-2 text-sm text-white rounded-[4px]" style={{ backgroundColor: "#15be53" }}>
                {converting ? "Converting..." : "Convert to Order"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-[6px] p-6 mb-6" style={{ border: "1px solid #e5edf5" }}>
        <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Product", "Variant", "Qty", "Unit Price", "Total"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quote.quote_items?.map((qi: any) => (
                <tr key={qi.id} style={{ borderBottom: "1px solid #e5edf5" }}>
                  <td className="px-4 py-2" style={{ color: "#0a1628" }}>
                    {qi.products?.item_name || "Unknown"}<br/>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>{qi.products?.item_code}</span>
                  </td>
                  <td className="px-4 py-2" style={{ color: "#64748d" }}>{qi.products?.variant || "—"}</td>
                  <td className="px-4 py-2" style={{ color: "#0a1628" }}>{qi.quantity}</td>
                  <td className="px-4 py-2" style={{ color: "#0a1628" }}>{qi.unit_price?.toLocaleString() || "—"}</td>
                  <td className="px-4 py-2" style={{ color: "#0a1628" }}>{qi.total?.toLocaleString() || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
        <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Internal Notes</h3>
        <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3}
          className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] mb-2" style={{ borderColor: "#e5edf5", color: "#0a1628" }}
          placeholder="Team-only notes..." />
        <button onClick={handleSaveNotes} className="px-4 py-1.5 text-sm text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Save Notes</button>
      </div>
    </div>
  );
}
