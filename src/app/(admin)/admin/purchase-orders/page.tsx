import { createClient } from "@/lib/supabase/server";
import { POList } from "./po-list";

export default async function PurchaseOrdersPage() {
  const supabase = await createClient();

  const { data: purchaseOrders } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name)")
    .order("created_at", { ascending: false });

  // Fetch item counts per purchase order
  const poIds = purchaseOrders?.map((po) => po.id) || [];
  let itemCounts: Record<string, number> = {};

  if (poIds.length > 0) {
    const { data: items } = await supabase
      .from("purchase_order_items")
      .select("purchase_order_id")
      .in("purchase_order_id", poIds);

    if (items) {
      itemCounts = items.reduce<Record<string, number>>((acc, item) => {
        acc[item.purchase_order_id] = (acc[item.purchase_order_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  const enriched = (purchaseOrders || []).map((po) => ({
    ...po,
    item_count: itemCounts[po.id] || 0,
  }));

  return <POList purchaseOrders={enriched} />;
}
