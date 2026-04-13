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
          <h1 className="text-3xl font-light flex items-center gap-3" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
            <span className="w-1 h-8 rounded-full inline-block" style={{ backgroundColor: "#14b8a6" }} />
            Suppliers
          </h1>
          <p className="mt-1" style={{ color: "#64748d" }}>{suppliers?.length || 0} suppliers</p>
        </div>
      </div>
      <SupplierTable suppliers={suppliers || []} />
    </div>
  );
}
