"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { updatePOStatus, deletePurchaseOrder } from "./actions";

interface PurchaseOrder {
  id: string;
  po_number: string;
  status: string;
  currency: string;
  subtotal: number;
  created_at: string;
  suppliers: { name: string } | null;
  item_count: number;
}

export function POList({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: string) {
    setLoading(id);
    const result = await updatePOStatus(id, status);
    if (result.error) alert(result.error);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this purchase order?")) return;
    setLoading(id);
    const result = await deletePurchaseOrder(id);
    if (result.error) alert(result.error);
    setLoading(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
          Purchase Orders
        </h1>
        <Link
          href="/admin/purchase-orders/new"
          className="px-4 py-2 text-sm text-white rounded-[4px] transition-colors hover:opacity-90"
          style={{ backgroundColor: "#1a6bb5" }}
        >
          New Purchase Order
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["PO Number", "Supplier", "Status", "Items", "Total", "Date", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-normal"
                  style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-[#f8fafc]" style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-3">
                  <Link href={`/admin/purchase-orders/${po.id}`} className="font-mono text-sm" style={{ color: "#1a6bb5" }}>
                    {po.po_number}
                  </Link>
                </td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>
                  {po.suppliers?.name || "\u2014"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={po.status} />
                </td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>
                  {po.item_count}
                </td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>
                  {po.subtotal?.toLocaleString()} {po.currency}
                </td>
                <td className="px-4 py-3" style={{ color: "#94a3b8" }}>
                  {new Date(po.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {po.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange(po.id, "sent")}
                        disabled={loading === po.id}
                        className="text-xs px-2 py-1 rounded-[4px] transition-colors"
                        style={{ color: "#1a6bb5", backgroundColor: "rgba(42,143,212,0.1)" }}
                      >
                        Send
                      </button>
                    )}
                    {po.status === "sent" && (
                      <button
                        onClick={() => handleStatusChange(po.id, "confirmed")}
                        disabled={loading === po.id}
                        className="text-xs px-2 py-1 rounded-[4px] transition-colors"
                        style={{ color: "#1a6bb5", backgroundColor: "rgba(42,143,212,0.1)" }}
                      >
                        Confirm
                      </button>
                    )}
                    {po.status === "confirmed" && (
                      <button
                        onClick={() => handleStatusChange(po.id, "received")}
                        disabled={loading === po.id}
                        className="text-xs px-2 py-1 rounded-[4px] transition-colors"
                        style={{ color: "#108c3d", backgroundColor: "rgba(21,190,83,0.1)" }}
                      >
                        Receive
                      </button>
                    )}
                    {(po.status === "draft" || po.status === "sent") && (
                      <button
                        onClick={() => handleStatusChange(po.id, "cancelled")}
                        disabled={loading === po.id}
                        className="text-xs px-2 py-1 rounded-[4px] transition-colors"
                        style={{ color: "#ea2261", backgroundColor: "rgba(234,34,97,0.1)" }}
                      >
                        Cancel
                      </button>
                    )}
                    {po.status === "draft" && (
                      <button
                        onClick={() => handleDelete(po.id)}
                        disabled={loading === po.id}
                        className="text-xs px-2 py-1 rounded-[4px] transition-colors"
                        style={{ color: "#ea2261", backgroundColor: "rgba(234,34,97,0.05)" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {purchaseOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#64748d" }}>
                  No purchase orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
