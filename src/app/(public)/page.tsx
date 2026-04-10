import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FadeIn, CountUp, Parallax } from "@/components/public/animations";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  const { data: products } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(180deg, #050d18 0%, #0a1628 40%, #0d1f3c 100%)" }}>
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Floating gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-[120px] animate-pulse" style={{ background: "radial-gradient(circle, #1a6bb5 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15 blur-[120px] animate-pulse" style={{ background: "radial-gradient(circle, #2a8fd4 0%, transparent 70%)", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[150px]" style={{ background: "radial-gradient(circle, #1a6bb5 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn delay={0.2} direction="none">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-[2px] uppercase mb-8" style={{ border: "1px solid rgba(42,143,212,0.3)", color: "rgba(42,143,212,0.9)", backgroundColor: "rgba(42,143,212,0.05)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2a8fd4] animate-pulse" />
              Trusted by Leading Hospitals
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl text-white leading-[0.95] tracking-tight" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
              Precision
              <br />
              <span className="relative">
                <span style={{ background: "linear-gradient(135deg, #ffffff 30%, #2a8fd4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Orthopedics
                </span>
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mt-8 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              World-class implants, instruments, and surgical systems engineered for exceptional patient outcomes.
            </p>
          </FadeIn>

          <FadeIn delay={0.8}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="group relative px-8 py-4 text-white text-sm tracking-wide uppercase rounded-lg overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(26,107,181,0.5)]"
                style={{ background: "linear-gradient(135deg, #1a6bb5, #155a96)" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Catalog
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2a8fd4] to-[#1a6bb5] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <Link
                href="/quote"
                className="px-8 py-4 text-sm tracking-wide uppercase rounded-lg transition-all duration-300 hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                Request Quote
              </Link>
            </div>
          </FadeIn>

          {/* Scroll indicator */}
          <FadeIn delay={1.2}>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <span className="text-[10px] tracking-[3px] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Scroll</span>
              <div className="w-[1px] h-12 relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-b from-white/30 to-transparent animate-[slideDown_2s_infinite]" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="relative py-20" style={{ background: "#0d1b2a" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(26,107,181,0.05) 0%, rgba(42,143,212,0.1) 50%, rgba(26,107,181,0.05) 100%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
            {[
              { value: 123, suffix: "+", label: "Product SKUs" },
              { value: 12, suffix: "", label: "Categories" },
              { value: 3500, suffix: "+", label: "Units in Stock" },
              { value: 50, suffix: "+", label: "Hospital Partners" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={0.1 * i} className="text-center px-4">
                <div className="text-4xl lg:text-5xl font-light text-white" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-xs tracking-[2px] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="py-24 lg:py-32" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs tracking-[3px] uppercase" style={{ color: "#1a6bb5" }}>Our Catalog</span>
              <h2 className="mt-4 text-4xl lg:text-5xl tracking-tight" style={{ color: "#0a1628", fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
                Browse by Category
              </h2>
              <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#64748d" }}>
                Comprehensive range of orthopedic solutions for every surgical need.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.map((cat, i) => (
              <FadeIn key={cat.id} delay={0.05 * i}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative block overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1"
                  style={{ border: "1px solid #e5edf5", background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a6bb5]/5 to-[#2a8fd4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: "linear-gradient(135deg, #e8f4fd, #c5e2f9)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium transition-colors duration-300 group-hover:text-[#1a6bb5]" style={{ color: "#0a1628" }}>
                      {cat.name}
                    </h3>
                    <div className="mt-3 flex items-center gap-1 text-xs transition-all duration-300 group-hover:gap-2" style={{ color: "#1a6bb5" }}>
                      <span>View products</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(rgba(42,143,212,0.4) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]" style={{ background: "#1a6bb5" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]" style={{ background: "#2a8fd4" }} />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-4xl lg:text-6xl text-white leading-tight" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
              Ready to equip your
              <br />
              <span style={{ background: "linear-gradient(135deg, #2a8fd4, #1a6bb5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                operating theatre?
              </span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-6 text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
              Submit a quote request and our team will respond within 24 hours with competitive pricing.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/quote"
                className="group px-10 py-4 text-white text-sm tracking-wide uppercase rounded-lg transition-all duration-500 hover:shadow-[0_0_40px_rgba(26,107,181,0.5)]"
                style={{ background: "linear-gradient(135deg, #1a6bb5, #155a96)" }}
              >
                <span className="flex items-center gap-2">
                  Request a Quote
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </Link>
              <Link href="/products" className="px-10 py-4 text-sm tracking-wide uppercase rounded-lg transition-all duration-300" style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
                Browse Catalog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============ TRUST / ABOUT ============ */}
      <section className="py-24 lg:py-32" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <span className="text-xs tracking-[3px] uppercase" style={{ color: "#1a6bb5" }}>About L&M</span>
              <h2 className="mt-4 text-4xl lg:text-5xl leading-tight" style={{ color: "#0a1628", fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
                Engineering trust in every implant
              </h2>
              <p className="mt-6 text-lg leading-relaxed" style={{ color: "#64748d" }}>
                L&M Medical Solutions provides hospitals and surgeons across Sudan with the highest quality orthopedic implants. From cortex screws to complete gamma nail systems, every product meets international standards.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                {[
                  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "ISO Certified" },
                  { icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064", label: "Regional Coverage" },
                  { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", label: "Full Inventory" },
                  { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Fast Delivery" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#e8f4fd" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                    </div>
                    <span className="text-sm font-medium mt-2" style={{ color: "#0a1628" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.2}>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1b2a, #1a2d42)", boxShadow: "rgba(3,3,39,0.25) 0px 30px 60px -15px" }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, rgba(26,107,181,0.2), rgba(42,143,212,0.1))", border: "1px solid rgba(42,143,212,0.2)" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(42,143,212,0.6)" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
                        </svg>
                      </div>
                      <p className="text-lg text-white/30" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>Premium Quality</p>
                      <p className="text-xs mt-2 tracking-[2px] uppercase text-white/15">Since establishment</p>
                    </div>
                  </div>
                </div>
                {/* Floating accent */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl" style={{ background: "linear-gradient(135deg, #1a6bb5, #2a8fd4)", opacity: 0.1 }} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
