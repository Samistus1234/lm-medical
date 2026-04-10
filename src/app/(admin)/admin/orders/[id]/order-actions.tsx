"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateOrderStatus, generateInvoice } from "../actions";

const statusFlow: Record<string, string[]> = {
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function OrderActions({ orderId, status, invoice }: { orderId: string; status: string; invoice: any }) {
  const router = useRouter();
  const nextStatuses = statusFlow[status] || [];

  return (
    <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
      <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Actions</h3>
      <div className="space-y-2">
        {nextStatuses.map((s) => (
          <button key={s} onClick={async () => { await updateOrderStatus(orderId, s); router.refresh(); }}
            className="block w-full py-2 text-sm text-white rounded-[4px] capitalize" style={{ backgroundColor: "#1a6bb5" }}>
            Mark as {s}
          </button>
        ))}
        {!invoice ? (
          <button onClick={async () => { await generateInvoice(orderId); router.refresh(); }}
            className="block w-full py-2 text-sm text-white rounded-[4px]" style={{ backgroundColor: "#15be53" }}>
            Generate Invoice
          </button>
        ) : (
          <Link href={`/admin/invoices`} className="block w-full py-2 text-sm text-center rounded-[4px]" style={{ color: "#1a6bb5", border: "1px solid #1a6bb5" }}>
            Invoice: {invoice.invoice_number} <StatusBadge status={invoice.status} />
          </Link>
        )}
      </div>
    </div>
  );
}
