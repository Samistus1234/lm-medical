import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/product-card";
import { AddToQuoteButton } from "@/components/public/add-to-quote-button";
import {
  FadeIn,
  FloatingParticles,
  LineReveal,
  Magnetic,
  TiltCard,
} from "@/components/public/animations";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("item_name, category, notes")
    .eq("item_code", slug)
    .single();

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.item_name,
    description: product.notes || `${product.item_name} — ${product.category}. Premium orthopedic implant from L&M Medical Solutions.`,
  };
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

  const stockColor =
    product.stock_qty === 0
      ? "#ea2261"
      : product.stock_qty <= 5
        ? "#9b6829"
        : "#108c3d";

  const stockLabel =
    product.stock_qty === 0
      ? "Out of Stock"
      : product.stock_qty <= 5
        ? "Low Stock"
        : "In Stock";

  return (
    <div>
      {/* Cinematic Header */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0f2240 50%, #0a1628 100%)",
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <FloatingParticles count={15} color="rgba(42,143,212,0.1)" />

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(26,107,181,0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          {/* Breadcrumb */}
          <FadeIn direction="up" delay={0.1}>
            <nav className="flex items-center gap-2 text-sm mb-8">
              <Link
                href="/products"
                className="transition-colors duration-300 hover:text-white"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Products
              </Link>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="transition-colors duration-300 hover:text-white"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {product.category}
              </Link>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>{product.item_name}</span>
            </nav>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: "#2a8fd4" }}
            >
              {product.category}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.1]"
              style={{
                color: "#ffffff",
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                letterSpacing: "-0.03em",
              }}
            >
              {product.item_name}
            </h1>
          </FadeIn>

          {product.variant && (
            <FadeIn direction="up" delay={0.4}>
              <div className="mt-4">
                <span
                  className="inline-flex items-center px-4 py-1.5 rounded-full text-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {product.variant}
                </span>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: "linear-gradient(to top, #ffffff, transparent)",
          }}
        />
      </section>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — Product Visual */}
          <FadeIn direction="left" delay={0.2}>
            <TiltCard intensity={6} glare className="rounded-2xl">
              <div
                className="aspect-square rounded-2xl relative flex items-center justify-center overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0a1628 0%, #132040 50%, #0d1a30 100%)",
                }}
              >
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Corner decorations */}
                <div className="absolute top-6 left-6 w-12 h-12" style={{ borderTop: "1px solid rgba(42,143,212,0.2)", borderLeft: "1px solid rgba(42,143,212,0.2)" }} />
                <div className="absolute bottom-6 right-6 w-12 h-12" style={{ borderBottom: "1px solid rgba(42,143,212,0.2)", borderRight: "1px solid rgba(42,143,212,0.2)" }} />

                {/* Glow */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 rounded-full"
                  style={{
                    background: "radial-gradient(ellipse, rgba(26,107,181,0.25) 0%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                />

                {/* Floating orbs */}
                <div
                  className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: "rgba(42,143,212,0.3)",
                    animation: "floatParticle 8s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(42,143,212,0.2)",
                    animation: "floatParticle 12s ease-in-out -4s infinite",
                  }}
                />

                {/* Product image or fallback icon */}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.item_name}
                    className="relative z-10 w-full h-full object-contain p-8"
                  />
                ) : (
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(42,143,212,0.5)"
                    strokeWidth="0.5"
                    className="relative z-10"
                  >
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                )}

                {/* Item code watermark */}
                <span
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-wider"
                  style={{ color: "rgba(42,143,212,0.25)" }}
                >
                  {product.item_code}
                </span>
              </div>
            </TiltCard>
          </FadeIn>

          {/* Right — Product Info */}
          <div>
            <FadeIn direction="right" delay={0.25}>
              {/* Category label */}
              <span
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
                style={{ color: "#1a6bb5" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#1a6bb5" }}
                />
                {product.category}
              </span>
            </FadeIn>

            <FadeIn direction="right" delay={0.3}>
              <h2
                className="text-2xl sm:text-3xl font-light mb-2"
                style={{
                  color: "#0a1628",
                  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                  letterSpacing: "-0.02em",
                }}
              >
                {product.item_name}
              </h2>
            </FadeIn>

            {product.variant && (
              <FadeIn direction="right" delay={0.35}>
                <span
                  className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm mb-5"
                  style={{
                    backgroundColor: "rgba(10,22,40,0.04)",
                    border: "1px solid #e5edf5",
                    color: "#64748d",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {product.variant}
                </span>
              </FadeIn>
            )}

            <FadeIn direction="right" delay={0.4}>
              <LineReveal delay={0.6} className="mb-8" color="rgba(26,107,181,0.2)" />
            </FadeIn>

            {/* Specs Card */}
            <FadeIn direction="right" delay={0.45}>
              <div
                className="rounded-2xl overflow-hidden mb-8"
                style={{
                  border: "1px solid #e5edf5",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{
                    color: "#64748d",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e5edf5",
                  }}
                >
                  Specifications
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                      <td
                        className="px-5 py-3.5 font-medium"
                        style={{ color: "#273951", backgroundColor: "rgba(248,250,252,0.5)", width: "40%" }}
                      >
                        Item Code
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[13px]" style={{ color: "#0a1628" }}>
                        {product.item_code}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                      <td
                        className="px-5 py-3.5 font-medium"
                        style={{ color: "#273951", width: "40%" }}
                      >
                        Category
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "#0a1628" }}>
                        {product.category}
                      </td>
                    </tr>
                    {product.variant && (
                      <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                        <td
                          className="px-5 py-3.5 font-medium"
                          style={{ color: "#273951", backgroundColor: "rgba(248,250,252,0.5)", width: "40%" }}
                        >
                          Variant / Size
                        </td>
                        <td className="px-5 py-3.5" style={{ color: "#0a1628" }}>
                          {product.variant}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: "1px solid #e5edf5" }}>
                      <td
                        className="px-5 py-3.5 font-medium"
                        style={{ color: "#273951", width: "40%" }}
                      >
                        Availability
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2">
                          {/* Animated dot */}
                          <span
                            className="relative w-2 h-2 rounded-full"
                            style={{ backgroundColor: stockColor }}
                          >
                            {product.stock_qty > 0 && (
                              <span
                                className="absolute inset-0 rounded-full animate-ping"
                                style={{
                                  backgroundColor: stockColor,
                                  opacity: 0.4,
                                }}
                              />
                            )}
                          </span>
                          <span style={{ color: stockColor, fontWeight: 500 }}>
                            {stockLabel}
                          </span>
                        </span>
                      </td>
                    </tr>
                    {product.notes && (
                      <tr>
                        <td
                          className="px-5 py-3.5 font-medium"
                          style={{ color: "#273951", backgroundColor: "rgba(248,250,252,0.5)", width: "40%" }}
                        >
                          Notes
                        </td>
                        <td className="px-5 py-3.5" style={{ color: "#0a1628" }}>
                          {product.notes}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            {/* Description */}
            {product.description && (
              <FadeIn direction="right" delay={0.45}>
                <div className="mb-8">
                  <h3
                    className="text-lg font-medium mb-3"
                    style={{ color: "#0a1628", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
                  >
                    Product Description
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748d" }}>
                    {product.description}
                  </p>
                </div>
              </FadeIn>
            )}

            {/* Add to Quote */}
            <FadeIn direction="right" delay={0.5}>
              <Magnetic strength={0.15}>
                <AddToQuoteButton
                  product={product}
                  className="relative overflow-hidden px-10 py-4 text-base font-medium text-white rounded-xl transition-all duration-300 hover:shadow-[0_12px_32px_rgba(26,107,181,0.35)] hover:-translate-y-0.5"
                />
              </Magnetic>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related && related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <FadeIn direction="up" delay={0.1}>
            <div className="text-center mb-12">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ color: "#1a6bb5" }}
              >
                Related Instruments
              </p>
              <h2
                className="text-2xl sm:text-3xl font-light"
                style={{
                  color: "#0a1628",
                  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                  letterSpacing: "-0.02em",
                }}
              >
                From the Same Collection
              </h2>
              <LineReveal delay={0.4} className="max-w-[80px] mx-auto mt-4" color="rgba(26,107,181,0.3)" />
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {related.map((p, i) => (
              <FadeIn key={p.id} direction="up" delay={0.15 + i * 0.1} distance={30}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
