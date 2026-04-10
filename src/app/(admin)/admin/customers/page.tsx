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
          <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Customers</h1>
          <p className="mt-1" style={{ color: "#64748d" }}>{customers?.length || 0} customers</p>
        </div>
      </div>
      <CustomerList customers={customers || []} />
    </div>
  );
}
