import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 style={{ color: "#0a1628" }} className="font-light" >
          Orthopedic Implants<br />
          <span style={{ color: "#1a6bb5" }}>You Can Trust</span>
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "#64748d" }}>
          Premium screws, plates, fixators, and complete systems for hospitals and surgeons across Sudan and the region.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/products" className="px-6 py-3 text-white rounded-[4px] transition-colors" style={{ backgroundColor: "#1a6bb5" }}>
            Browse Catalog
          </Link>
          <Link href="/quote" className="px-6 py-3 rounded-[4px] transition-colors" style={{ color: "#1a6bb5", border: "1px solid #1a6bb5" }}>
            Request Quote
          </Link>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: "#0a1628" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { value: "123+", label: "Products" },
            { value: "12", label: "Categories" },
            { value: "3,500+", label: "Units in Stock" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-light text-white">{stat.value}</p>
              <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-light text-center mb-8" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-[6px] p-6 text-center transition-shadow hover:shadow-[rgba(50,50,93,0.25)_0px_30px_45px_-30px,rgba(0,0,0,0.1)_0px_18px_36px_-18px]"
              style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e8f4fd" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <h3 className="text-sm font-normal group-hover:text-[#1a6bb5] transition-colors" style={{ color: "#0a1628" }}>
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Blog Posts */}
      {posts && posts.length > 0 && (
        <section className="py-16" style={{ backgroundColor: "#f8fafc" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-light text-center mb-8" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
              Latest Updates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <div className="bg-white rounded-[6px] overflow-hidden transition-shadow hover:shadow-[rgba(50,50,93,0.25)_0px_30px_45px_-30px,rgba(0,0,0,0.1)_0px_18px_36px_-18px]"
                    style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}>
                    <div className="aspect-video bg-white flex items-center justify-center" style={{ borderBottom: "1px solid #e5edf5" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-normal group-hover:text-[#1a6bb5] transition-colors" style={{ color: "#0a1628" }}>
                        {post.title}
                      </h3>
                      <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                        {post.published_at && new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
