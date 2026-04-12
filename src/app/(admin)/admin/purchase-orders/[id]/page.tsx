import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PODetail } from "./po-detail";

interface PageProps { params: Promise<{ id: string }> }

export default async function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: po } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name, contact_person, email, phone, whatsapp), purchase_order_items(*, products(item_code, item_name, variant))")
    .eq("id", id)
    .single();

  if (!po) notFound();

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#64748d" }}>
        <Link href="/admin/purchase-orders" className="hover:text-[#1a6bb5]">Purchase Orders</Link>
        <span>/</span>
        <span style={{ color: "#0a1628" }}>{po.po_number}</span>
      </nav>

      <PODetail po={po} />
    </div>
  );
}
