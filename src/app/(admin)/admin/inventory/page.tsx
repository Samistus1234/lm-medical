import { createClient } from "@/lib/supabase/server";
import { InventoryTable } from "./inventory-table";

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("category")
    .order("item_name");

  const categories = [...new Set(products?.map((p) => p.category) || [])].sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Inventory</h1>
          <p className="mt-1" style={{ color: "#64748d" }}>{products?.length || 0} products</p>
        </div>
      </div>
      <InventoryTable products={products || []} categories={categories} />
    </div>
  );
}
