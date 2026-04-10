import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/product-card";
import { AddToQuoteButton } from "@/components/public/add-to-quote-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Find product by lowercase item_code
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  const product = products?.find(
    (p) => p.item_code.toLowerCase() === slug.toLowerCase()
  );

  if (!product) {
    notFound();
  }

  // Get related products (same category, exclude current)
  const { data: related } = await supabase
    .from("products")
    .select("id, item_code, item_name, variant, category, stock_qty, images")
    .eq("category", product.category)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  function StockIndicator({ qty }: { qty: number }) {
    if (qty === 0) return <span style={{ color: "#ea2261" }}>Out of Stock</span>;
    if (qty <= 5) return <span style={{ color: "#9b6829" }}>Low Stock</span>;
    return <span style={{ color: "#108c3d" }}>In Stock</span>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "#64748d" }}>
        <Link href="/products" className="hover:text-[#1a6bb5]">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1a6bb5]">
          {product.category}
        </Link>
        <span>/</span>
        <span style={{ color: "#0a1628" }}>{product.item_name}</span>
      </nav>

      {/* Product */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-[#f8fafc] rounded-[8px] flex items-center justify-center" style={{ border: "1px solid #e5edf5" }}>
          <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="0.5">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          </svg>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm" style={{ color: "#1a6bb5" }}>{product.category}</span>
          </div>

          <h1 className="text-3xl font-light mb-2" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
            {product.item_name}
          </h1>

          {product.variant && (
            <p className="text-lg mb-4" style={{ color: "#64748d" }}>
              {product.variant}
            </p>
          )}

          {/* Specs table */}
          <div className="rounded-[6px] overflow-hidden mb-6" style={{ border: "1px solid #e5edf5" }}>
            <table className="w-full text-sm">
              <tbody>
                <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                  <td className="px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc" }}>Item Code</td>
                  <td className="px-4 py-3" style={{ color: "#0a1628" }}>{product.item_code}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                  <td className="px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc" }}>Category</td>
                  <td className="px-4 py-3" style={{ color: "#0a1628" }}>{product.category}</td>
                </tr>
                {product.variant && (
                  <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                    <td className="px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc" }}>Variant / Size</td>
                    <td className="px-4 py-3" style={{ color: "#0a1628" }}>{product.variant}</td>
                  </tr>
                )}
                <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                  <td className="px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc" }}>Availability</td>
                  <td className="px-4 py-3"><StockIndicator qty={product.stock_qty} /></td>
                </tr>
                {product.notes && (
                  <tr>
                    <td className="px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc" }}>Notes</td>
                    <td className="px-4 py-3" style={{ color: "#0a1628" }}>{product.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <AddToQuoteButton
            product={product}
            className="px-8 py-3 text-base text-white rounded-[4px] transition-colors"
          />
        </div>
      </div>

      {/* Related Products */}
      {related && related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
