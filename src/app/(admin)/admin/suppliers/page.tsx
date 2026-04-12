import { createClient } from "@/lib/supabase/server";
import { SupplierTable } from "./supplier-table";

export default async function SuppliersPage() {
  const supabase = await createClient();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Suppliers</h1>
          <p className="mt-1" style={{ color: "#64748d" }}>{suppliers?.length || 0} suppliers</p>
        </div>
      </div>
      <SupplierTable suppliers={suppliers || []} />
    </div>
  );
}
