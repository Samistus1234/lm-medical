import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/product-card";
import { ProductFilters } from "@/components/public/product-filters";

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-light" style={{ color: "#0a1628" }}>
          {params.category || "All Products"}
        </h1>
        <p className="mt-2" style={{ color: "#64748d" }}>
          {products?.length || 0} products found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <ProductFilters categories={categories} />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: "#64748d" }}>No products found</p>
              <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
