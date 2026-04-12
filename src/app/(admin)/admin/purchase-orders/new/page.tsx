import { createClient } from "@/lib/supabase/server";
import { POForm } from "./po-form";

export default async function NewPurchaseOrderPage() {
  const supabase = await createClient();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const { data: products } = await supabase
    .from("products")
    .select("id, item_code, item_name, variant, category, stock_qty, cost_price_usd, supplier_id")
    .eq("is_active", true)
    .order("item_name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
          Create Purchase Order
        </h1>
        <p className="mt-1" style={{ color: "#64748d" }}>
          Select a supplier to auto-populate low-stock items
        </p>
      </div>
      <POForm suppliers={suppliers || []} products={products || []} />
    </div>
  );
}
