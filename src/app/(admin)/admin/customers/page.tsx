import { createClient } from "@/lib/supabase/server";
import { CustomerList } from "./customer-list";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light flex items-center gap-3" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
            <span className="w-1 h-8 rounded-full inline-block" style={{ backgroundColor: "#8b5cf6" }} />
            Customers
          </h1>
          <p className="mt-1" style={{ color: "#64748d" }}>{customers?.length || 0} customers</p>
        </div>
      </div>
      <CustomerList customers={customers || []} />
    </div>
  );
}
