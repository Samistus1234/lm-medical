import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";
import { QuoteDetail } from "./quote-detail";

interface PageProps { params: Promise<{ id: string }> }

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, quote_items(*, products(item_code, item_name, variant))")
    .eq("id", id)
    .single();

  if (!quote) notFound();

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#64748d" }}>
        <Link href="/admin/quotes" className="hover:text-[#1a6bb5]">Quotes</Link>
        <span>/</span>
        <span style={{ color: "#0a1628" }}>{quote.quote_number}</span>
      </nav>
      <QuoteDetail quote={quote} />
    </div>
  );
}
