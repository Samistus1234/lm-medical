import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our catalog of orthopedic implants — screws, plates, nails, fixators, and surgical systems from leading manufacturers.",
};
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/product-card";
import { ProductFilters } from "@/components/public/product-filters";
import { FadeIn, FloatingParticles, LineReveal } from "@/components/public/animations";

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("products")
    .select("id, item_code, item_name, variant, category, stock_qty, images")
    .eq("is_active", true)
    .order("category")
    .order("item_name");

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.search) {
    query = query.or(
      `item_name.ilike.%${params.search}%,item_code.ilike.%${params.search}%,variant.ilike.%${params.search}%`
    );
  }

  const { data: products } = await query;

  // Get distinct categories for filters
  const { data: allProducts } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = [...new Set(allProducts?.map((p) => p.category) || [])].sort();

  const displayTitle = params.category || "Our Catalog";

  return (
    <div>
      {/* Hero Banner */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0f2240 50%, #0a1628 100%)",
        }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <FloatingParticles count={20} color="rgba(42,143,212,0.12)" />

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(26,107,181,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 text-center">
          <FadeIn direction="up" delay={0.1}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: "#2a8fd4" }}
            >
              L&M Medical Solutions
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] mb-6"
              style={{
                color: "#ffffff",
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                letterSpacing: "-0.03em",
              }}
            >
              {displayTitle}
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.35}>
            <LineReveal delay={0.6} color="rgba(42,143,212,0.4)" className="max-w-[120px] mx-auto mb-6" />
          </FadeIn>

          {/* Stats mini-bar */}
          <FadeIn direction="up" delay={0.45}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: "#2a8fd4",
                  boxShadow: "0 0 8px rgba(42,143,212,0.5)",
                }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {products?.length || 0} products available
              </span>
            </div>
          </FadeIn>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: "linear-gradient(to top, #ffffff, transparent)",
          }}
        />
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <FadeIn direction="right" delay={0.2}>
              <div
                className="sticky top-28 rounded-2xl p-6"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e5edf5",
                }}
              >
                <Suspense
                  fallback={
                    <div className="animate-pulse space-y-4">
                      <div className="h-10 rounded-xl" style={{ backgroundColor: "#e5edf5" }} />
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-8 rounded-lg" style={{ backgroundColor: "#e5edf5" }} />
                        ))}
                      </div>
                    </div>
                  }
                >
                  <ProductFilters categories={categories} />
                </Suspense>
              </div>
            </FadeIn>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
                {products.map((product, i) => (
                  <FadeIn
                    key={product.id}
                    direction="up"
                    delay={0.1 + (i % 6) * 0.08}
                    distance={40}
                  >
                    <ProductCard product={product} />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <FadeIn direction="up" delay={0.2}>
                <div className="text-center py-24">
                  {/* Elegant empty state */}
                  <div
                    className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #f8fafc, #e5edf5)",
                      border: "1px solid #e5edf5",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <h3
                    className="text-xl font-light mb-2"
                    style={{
                      color: "#0a1628",
                      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    }}
                  >
                    No instruments found
                  </h3>
                  <p className="text-sm" style={{ color: "#64748d" }}>
                    Try adjusting your search or selecting a different category
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
