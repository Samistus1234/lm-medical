import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*, quote_items(id)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-light mb-6 flex items-center gap-3" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
        <span className="w-1 h-8 rounded-full inline-block" style={{ backgroundColor: "#f97316" }} />
        Quotes
      </h1>

      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Quote #", "Contact", "Organization", "Status", "Items", "Total", "Date"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotes?.map((q) => (
              <tr key={q.id} className="hover:bg-[#fff7ed] transition-colors" style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-3">
                  <Link href={`/admin/quotes/${q.id}`} className="font-mono text-sm" style={{ color: "#1a6bb5" }}>{q.quote_number}</Link>
                </td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>{q.contact_name}</td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{q.organization || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{q.quote_items?.length || 0}</td>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>{q.total_amount ? `${q.total_amount.toLocaleString()} ${q.currency}` : "—"}</td>
                <td className="px-4 py-3" style={{ color: "#94a3b8" }}>{new Date(q.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!quotes || quotes.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#64748d" }}>No quotes yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
