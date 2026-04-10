"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AddToQuoteButton } from "@/components/public/add-to-quote-button";
import { addToCart } from "@/lib/quote-cart";
import Link from "next/link";

interface Product {
  id: string;
  item_code: string;
  item_name: string;
  variant: string | null;
  category: string;
  stock_qty: number;
  notes: string | null;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("products")
      .select("id, item_code, item_name, variant, category, stock_qty, notes")
      .in("id", ids)
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, [searchParams]);

  function addAllToQuote() {
    products.forEach((p) => {
      addToCart({
        productId: p.id,
        itemCode: p.item_code,
        itemName: p.item_name,
        variant: p.variant,
        category: p.category,
      });
    });
  }

  function stockLabel(qty: number) {
    if (qty === 0) return { text: "Out of Stock", color: "#ea2261" };
    if (qty <= 5) return { text: "Low Stock", color: "#9b6829" };
    return { text: "In Stock", color: "#108c3d" };
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p style={{ color: "#64748d" }}>Loading comparison...</p>
      </div>
    );
  }

  if (ids.length === 0 || products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-3xl font-light mb-4" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
          Compare Products
        </h1>
        <p style={{ color: "#64748d" }}>Select products to compare from the catalog.</p>
        <Link href="/products" className="inline-block mt-4 px-6 py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  const rows = [
    { label: "Item Code", render: (p: Product) => p.item_code },
    { label: "Category", render: (p: Product) => p.category },
    { label: "Variant / Size", render: (p: Product) => p.variant || "—" },
    { label: "Availability", render: (p: Product) => {
      const s = stockLabel(p.stock_qty);
      return <span style={{ color: s.color }}>{s.text}</span>;
    }},
    { label: "Notes", render: (p: Product) => p.notes || "—" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
            Compare Products
          </h1>
          <p className="mt-2" style={{ color: "#64748d" }}>
            Comparing {products.length} products
          </p>
        </div>
        <button
          onClick={addAllToQuote}
          className="px-4 py-2 text-sm text-white rounded-[4px]"
          style={{ backgroundColor: "#1a6bb5" }}
        >
          Add All to Quote
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}>
                Specification
              </th>
              {products.map((p) => (
                <th key={p.id} className="text-left px-4 py-3 font-normal" style={{ color: "#0a1628", backgroundColor: "#f8fafc", border: "1px solid #e5edf5", minWidth: "200px" }}>
                  <Link href={`/products/${p.item_code.toLowerCase()}`} className="hover:text-[#1a6bb5]">
                    {p.item_name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}>
                  {row.label}
                </td>
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3" style={{ color: "#0a1628", border: "1px solid #e5edf5" }}>
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            {/* Add to Quote row */}
            <tr>
              <td className="px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}>
                Action
              </td>
              {products.map((p) => (
                <td key={p.id} className="px-4 py-3" style={{ border: "1px solid #e5edf5" }}>
                  <AddToQuoteButton product={p} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
