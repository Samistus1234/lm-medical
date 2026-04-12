"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { updatePOStatus, deletePurchaseOrder, sendPOEmail, sendPOWhatsApp } from "../actions";

interface PurchaseOrderItem {
  id: string;
  quantity: number;
  unit_cost: number;
  total: number;
  products: { item_code: string; item_name: string; variant: string | null } | null;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  status: string;
  currency: string;
  subtotal: number;
  notes: string | null;
  created_at: string;
  sent_at: string | null;
  received_at: string | null;
  suppliers: {
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
  } | null;
  purchase_order_items: PurchaseOrderItem[];
}

export function PODetail({ po }: { po: PurchaseOrder }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatusChange(status: string) {
    setLoading(status);
    const result = await updatePOStatus(po.id, status);
    if (result.error) alert(result.error);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this purchase order?")) return;
    setLoading("delete");
    const result = await deletePurchaseOrder(po.id);
    if (result.error) {
      alert(result.error);
      setLoading(null);
    } else {
      router.push("/admin/purchase-orders");
    }
  }

  async function handleSendEmail() {
    if (!po.suppliers?.email) {
      alert("Supplier has no email address.");
      return;
    }
    setLoading("email");
    const result = await sendPOEmail(po.id);
    if (result.error) alert(result.error);
    else alert("Email sent to supplier.");
    setLoading(null);
    router.refresh();
  }

  async function handleSendWhatsApp() {
    if (!po.suppliers?.whatsapp) {
      alert("Supplier has no WhatsApp number.");
      return;
    }
    setLoading("whatsapp");
    const result = await sendPOWhatsApp(po.id);
    if (result.error) alert(result.error);
    else alert("WhatsApp message sent to supplier.");
    setLoading(null);
    router.refresh();
  }

  const items = po.purchase_order_items || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
          {po.po_number}
        </h1>
        <StatusBadge status={po.status} />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Supplier info */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Supplier</h3>
          <p style={{ color: "#0a1628" }}>{po.suppliers?.name || "—"}</p>
          {po.suppliers?.contact_person && (
            <p className="text-sm" style={{ color: "#64748d" }}>{po.suppliers.contact_person}</p>
          )}
          {po.suppliers?.email && (
            <p className="text-sm" style={{ color: "#64748d" }}>{po.suppliers.email}</p>
          )}
          {po.suppliers?.phone && (
            <p className="text-sm" style={{ color: "#64748d" }}>{po.suppliers.phone}</p>
          )}
          {po.suppliers?.whatsapp && (
            <p className="text-sm" style={{ color: "#64748d" }}>WhatsApp: {po.suppliers.whatsapp}</p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Summary</h3>
          <p className="text-sm" style={{ color: "#64748d" }}>
            Subtotal: <span style={{ color: "#0a1628" }}>{po.subtotal?.toLocaleString()} {po.currency}</span>
          </p>
          <p className="text-sm mt-1" style={{ color: "#64748d" }}>
            Items: <span style={{ color: "#0a1628" }}>{items.length}</span>
          </p>
          <p className="text-sm mt-1" style={{ color: "#64748d" }}>
            Created: <span style={{ color: "#0a1628" }}>{new Date(po.created_at).toLocaleDateString()}</span>
          </p>
          {po.sent_at && (
            <p className="text-sm mt-1" style={{ color: "#64748d" }}>
              Sent: <span style={{ color: "#0a1628" }}>{new Date(po.sent_at).toLocaleDateString()}</span>
            </p>
          )}
          {po.received_at && (
            <p className="text-sm mt-1" style={{ color: "#64748d" }}>
              Received: <span style={{ color: "#0a1628" }}>{new Date(po.received_at).toLocaleDateString()}</span>
            </p>
          )}
          {po.notes && (
            <p className="text-sm mt-3" style={{ color: "#64748d" }}>
              Notes: <span style={{ color: "#0a1628" }}>{po.notes}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Actions</h3>
          <div className="flex flex-col gap-2">
            {po.status === "draft" && (
              <>
                <button
                  onClick={() => handleStatusChange("sent")}
                  disabled={loading !== null}
                  className="w-full text-sm px-3 py-2 rounded-[4px] text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#1a6bb5" }}
                >
                  {loading === "sent" ? "Updating..." : "Mark as Sent"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading !== null}
                  className="w-full text-sm px-3 py-2 rounded-[4px] transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ color: "#ea2261", backgroundColor: "rgba(234,34,97,0.08)" }}
                >
                  {loading === "delete" ? "Deleting..." : "Delete"}
                </button>
                <Link
                  href={`/api/purchase-orders/${po.id}/pdf`}
                  className="w-full text-sm px-3 py-2 rounded-[4px] text-center transition-colors hover:opacity-90"
                  style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}
                >
                  Download PDF
                </Link>
              </>
            )}
            {po.status === "sent" && (
              <button
                onClick={() => handleStatusChange("confirmed")}
                disabled={loading !== null}
                className="w-full text-sm px-3 py-2 rounded-[4px] text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#1a6bb5" }}
              >
                {loading === "confirmed" ? "Updating..." : "Mark as Confirmed"}
              </button>
            )}
            {po.status === "confirmed" && (
              <button
                onClick={() => handleStatusChange("received")}
                disabled={loading !== null}
                className="w-full text-sm px-3 py-2 rounded-[4px] text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#108c3d" }}
              >
                {loading === "received" ? "Updating..." : "Mark as Received (Updates Stock)"}
              </button>
            )}
            {po.status === "received" && (
              <>
                <p className="text-sm" style={{ color: "#108c3d" }}>
                  Received on {po.received_at ? new Date(po.received_at).toLocaleDateString() : "—"}
                </p>
                <Link
                  href={`/api/purchase-orders/${po.id}/pdf`}
                  className="w-full text-sm px-3 py-2 rounded-[4px] text-center transition-colors hover:opacity-90"
                  style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}
                >
                  Download PDF
                </Link>
              </>
            )}
            {po.status === "cancelled" && (
              <p className="text-sm" style={{ color: "#ea2261" }}>This purchase order has been cancelled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Send to Supplier */}
      {po.status !== "cancelled" && (
        <div className="bg-white rounded-[6px] p-6 mb-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Send to Supplier</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendEmail}
              disabled={loading !== null || !po.suppliers?.email}
              className="text-sm px-4 py-2 rounded-[4px] text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#1a6bb5" }}
            >
              {loading === "email" ? "Sending..." : "Send via Email"}
            </button>
            <button
              onClick={handleSendWhatsApp}
              disabled={loading !== null || !po.suppliers?.whatsapp}
              className="text-sm px-4 py-2 rounded-[4px] text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#25D366" }}
            >
              {loading === "whatsapp" ? "Sending..." : "Send via WhatsApp"}
            </button>
            {!po.suppliers?.email && !po.suppliers?.whatsapp && (
              <p className="text-sm" style={{ color: "#94a3b8" }}>Supplier has no email or WhatsApp on file.</p>
            )}
          </div>
        </div>
      )}

      {/* Items table */}
      <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
        <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Items</h3>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Item Code", "Product", "Variant", "Qty", "Unit Cost", "Line Total"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2 font-normal"
                  style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-2 font-mono text-xs" style={{ color: "#94a3b8" }}>
                  {item.products?.item_code || "—"}
                </td>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>
                  {item.products?.item_name || "—"}
                </td>
                <td className="px-4 py-2" style={{ color: "#64748d" }}>
                  {item.products?.variant || "—"}
                </td>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>
                  {item.quantity}
                </td>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>
                  {item.unit_cost?.toLocaleString()}
                </td>
                <td className="px-4 py-2" style={{ color: "#0a1628" }}>
                  {item.total?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
