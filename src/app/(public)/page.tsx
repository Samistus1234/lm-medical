import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FadeIn,
  TextReveal,
  LineReveal,
  CountUp,
  Parallax,
  Magnetic,
  FloatingParticles,
  GlowingOrb,
  TiltCard,
  Marquee,
} from "@/components/public/animations";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="overflow-hidden">

      {/* ═══════════════════════════════════════
          HERO — Cinematic full-viewport entrance
          ═══════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(180deg, #020810 0%, #050d18 20%, #0a1628 50%, #0d1f3c 100%)" }}
      >
        {/* Animated grid with perspective */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(42,143,212,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(42,143,212,0.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
        }} />

        {/* Floating particles */}
        <FloatingParticles count={40} color="rgba(42,143,212,0.12)" />

        {/* Animated orbs */}
        <GlowingOrb size={500} className="top-[10%] -left-[200px] opacity-20" speed={12} />
        <GlowingOrb size={600} color1="#155a96" color2="#0d1b2a" className="bottom-[5%] -right-[250px] opacity-15" speed={15} />
        <GlowingOrb size={300} color1="#2a8fd4" color2="transparent" className="top-[60%] left-[30%] opacity-10" speed={10} />

        {/* Radial spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] opacity-30"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(26,107,181,0.2) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          {/* Badge */}
          <FadeIn delay={0.3} direction="none" scale={0.9}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-xs tracking-[2.5px] uppercase mb-10"
              style={{ border: "1px solid rgba(42,143,212,0.25)", color: "rgba(42,143,212,0.9)", backgroundColor: "rgba(42,143,212,0.04)" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#2a8fd4] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2a8fd4]" />
              </span>
              Trusted by Leading Hospitals
            </div>
          </FadeIn>

          {/* Main headline with text reveal */}
          <div className="text-5xl sm:text-7xl lg:text-[110px] text-white leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
            <FadeIn delay={0.5} distance={80}>
              <span className="block">Precision</span>
            </FadeIn>
            <FadeIn delay={0.7} distance={80}>
              <span className="block" style={{
                background: "linear-gradient(135deg, #ffffff 0%, #c5e2f9 40%, #2a8fd4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Orthopedics
              </span>
            </FadeIn>
          </div>

          {/* Decorative line */}
          <LineReveal delay={1} className="max-w-[200px] mx-auto mt-8" />

          {/* Subtitle */}
          <FadeIn delay={1.1}>
            <p className="mt-8 text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-light"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              World-class implants, instruments, and surgical systems
              <br className="hidden sm:block" />
              engineered for <span style={{ color: "rgba(42,143,212,0.9)" }}>exceptional patient outcomes</span>.
            </p>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={1.3}>
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Magnetic strength={0.2}>
                <Link
                  href="/products"
                  className="group relative px-10 py-5 text-white text-sm tracking-[2px] uppercase rounded-xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_60px_rgba(26,107,181,0.4)]"
                  style={{ background: "linear-gradient(135deg, #1a6bb5, #155a96)" }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Explore Catalog
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2a8fd4] to-[#1a6bb5] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.15}>
                <Link
                  href="/quote"
                  className="group px-10 py-5 text-sm tracking-[2px] uppercase rounded-xl transition-all duration-500 hover:bg-white/[0.06]"
                  style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span className="flex items-center gap-3">
                    Request Quote
                    <span className="w-6 h-[1px] bg-current transform group-hover:w-10 transition-all duration-500" />
                  </span>
                </Link>
              </Magnetic>
            </div>
          </FadeIn>

          {/* Scroll indicator */}
          <FadeIn delay={1.8}>
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              <span className="text-[9px] tracking-[4px] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>Discover</span>
              <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="w-1 h-2 rounded-full bg-white/40 animate-[scrollDot_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MARQUEE — Scrolling product categories
          ═══════════════════════════════════════ */}
      <section className="py-6 overflow-hidden" style={{ background: "#0d1b2a", borderTop: "1px solid rgba(42,143,212,0.1)", borderBottom: "1px solid rgba(42,143,212,0.1)" }}>
        <Marquee speed={40} className="opacity-30">
          <div className="flex items-center gap-8 px-4">
            {["Cortex Screws", "DCP Plates", "External Fixators", "Gamma Systems", "Locked Plates", "Titanium Nails", "Schanz Screws", "Cannulated Screws", "K-Wires", "DHS Plates", "Lag Screws", "Cerclage Wire"].map((item) => (
              <span key={item} className="text-xs tracking-[3px] uppercase whitespace-nowrap flex items-center gap-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                {item}
                <span className="w-1 h-1 rounded-full bg-[#2a8fd4]" />
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      {/* ═══════════════════════════════════════
          STATS — Animated counters
          ═══════════════════════════════════════ */}
      <section className="relative py-24" style={{ background: "linear-gradient(180deg, #0d1b2a, #0a1628)" }}>
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(26,107,181,0.08) 0%, transparent 60%)",
        }} />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { value: productCount || 123, suffix: "+", label: "Product SKUs", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
              { value: 12, suffix: "", label: "Categories", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
              { value: 3500, suffix: "+", label: "Units in Stock", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" },
              { value: 50, suffix: "+", label: "Hospital Partners", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={0.15 * i} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: "rgba(42,143,212,0.08)", border: "1px solid rgba(42,143,212,0.1)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(42,143,212,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={stat.icon} />
                  </svg>
                </div>
                <div className="text-4xl lg:text-5xl font-light text-white tracking-tight" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-3 text-[11px] tracking-[2.5px] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES — 3D tilt cards
          ═══════════════════════════════════════ */}
      <section className="py-28 lg:py-36 relative" style={{ background: "#ffffff" }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #e5edf5, transparent)" }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-[11px] tracking-[4px] uppercase" style={{ color: "#1a6bb5" }}>Our Catalog</span>
              <h2 className="mt-5 text-4xl lg:text-6xl tracking-tight" style={{ color: "#0a1628", fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
                Browse by Category
              </h2>
              <LineReveal delay={0.3} className="max-w-[120px] mx-auto mt-6" />
              <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "#64748d" }}>
                A comprehensive range of orthopedic solutions designed for precision and reliability in every surgical procedure.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories?.map((cat, i) => (
              <FadeIn key={cat.id} delay={0.06 * i} distance={40}>
                <TiltCard className="relative" intensity={8}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group relative block overflow-hidden rounded-2xl p-8 lg:p-10 transition-all duration-700"
                    style={{ border: "1px solid rgba(229,237,245,0.8)", background: "linear-gradient(145deg, #fafcfe 0%, #ffffff 100%)" }}
                  >
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a6bb5]/[0.03] via-transparent to-[#2a8fd4]/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1a6bb5] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />

                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-700 group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgba(26,107,181,0.15)]"
                        style={{ background: "linear-gradient(135deg, #e8f4fd, #d0e8f9)" }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                      </div>
                      <h3 className="text-[15px] font-medium transition-colors duration-500 group-hover:text-[#1a6bb5]" style={{ color: "#0a1628" }}>
                        {cat.name}
                      </h3>
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium overflow-hidden" style={{ color: "#1a6bb5" }}>
                        <span className="transform group-hover:translate-x-0 -translate-x-1 opacity-0 group-hover:opacity-100 transition-all duration-500">Explore</span>
                        <svg className="w-4 h-4 transform -translate-x-6 group-hover:translate-x-0 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER — Cinematic gradient
          ═══════════════════════════════════════ */}
      <section className="relative py-32 lg:py-40 overflow-hidden" style={{ background: "linear-gradient(135deg, #050d18 0%, #0a1628 30%, #0d1f3c 60%, #0a1628 100%)" }}>
        <FloatingParticles count={20} color="rgba(42,143,212,0.08)" />
        <GlowingOrb size={400} className="top-[20%] left-[10%] opacity-15" speed={10} />
        <GlowingOrb size={350} color1="#155a96" color2="transparent" className="bottom-[10%] right-[15%] opacity-10" speed={13} />

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="text-[11px] tracking-[4px] uppercase" style={{ color: "rgba(42,143,212,0.6)" }}>Get Started</span>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h2 className="mt-6 text-4xl sm:text-5xl lg:text-7xl text-white leading-[0.95]" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
              Ready to equip your
              <br />
              <span style={{ background: "linear-gradient(135deg, #c5e2f9 0%, #2a8fd4 50%, #1a6bb5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                operating theatre?
              </span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="mt-8 text-lg lg:text-xl max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              Submit a quote request and our specialist team will respond within 24 hours with competitive pricing tailored to your needs.
            </p>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Magnetic strength={0.2}>
                <Link
                  href="/quote"
                  className="group relative px-12 py-5 text-white text-sm tracking-[2px] uppercase rounded-xl overflow-hidden transition-all duration-700 hover:shadow-[0_0_60px_rgba(26,107,181,0.4)]"
                  style={{ background: "linear-gradient(135deg, #1a6bb5, #155a96)" }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Request a Quote
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2a8fd4] to-[#1a6bb5] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                </Link>
              </Magnetic>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST — Split layout
          ═══════════════════════════════════════ */}
      <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <FadeIn direction="left">
                <span className="text-[11px] tracking-[4px] uppercase" style={{ color: "#1a6bb5" }}>Why L&M Medical</span>
              </FadeIn>
              <FadeIn direction="left" delay={0.1}>
                <h2 className="mt-5 text-4xl lg:text-5xl leading-[1.1]" style={{ color: "#0a1628", fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 400 }}>
                  Engineering trust
                  <br />in every implant
                </h2>
              </FadeIn>
              <FadeIn direction="left" delay={0.2}>
                <LineReveal delay={0.5} className="max-w-[80px] mt-6" />
              </FadeIn>
              <FadeIn direction="left" delay={0.3}>
                <p className="mt-6 text-lg leading-relaxed" style={{ color: "#64748d" }}>
                  L&M Medical Solutions provides hospitals and surgeons across Sudan and the region with the highest quality orthopedic implants and instruments — from cortex screws to complete gamma nail systems.
                </p>
              </FadeIn>

              <div className="mt-10 grid grid-cols-2 gap-5">
                {[
                  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "ISO Certified", desc: "International quality standards" },
                  { icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945", title: "Regional Coverage", desc: "Across Sudan & East Africa" },
                  { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", title: "Full Inventory", desc: "123+ SKUs always in stock" },
                  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Fast Delivery", desc: "24-48 hour response time" },
                ].map((item, i) => (
                  <FadeIn key={item.title} delay={0.4 + i * 0.1} direction="left">
                    <div className="group p-4 rounded-xl transition-all duration-500 hover:bg-[#f8fafc]" style={{ border: "1px solid transparent" }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:shadow-[0_4px_20px_rgba(26,107,181,0.12)]"
                        style={{ background: "linear-gradient(135deg, #e8f4fd, #d0e8f9)" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                      </div>
                      <h4 className="text-sm font-medium" style={{ color: "#0a1628" }}>{item.title}</h4>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{item.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            <FadeIn direction="right" delay={0.2}>
              <Parallax speed={-0.2}>
                <div className="relative">
                  {/* Main visual */}
                  <TiltCard intensity={5} className="relative z-10">
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg, #0d1b2a, #1a2d42)", boxShadow: "rgba(3,3,39,0.3) 0px 40px 80px -20px" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-28 h-28 mx-auto rounded-3xl flex items-center justify-center mb-8 animate-[pulse_4s_ease-in-out_infinite]"
                            style={{ background: "linear-gradient(135deg, rgba(26,107,181,0.15), rgba(42,143,212,0.08))", border: "1px solid rgba(42,143,212,0.15)" }}>
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(42,143,212,0.5)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                              <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
                            </svg>
                          </div>
                          <p className="text-xl text-white/25" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>Premium Quality</p>
                          <p className="text-[10px] mt-3 tracking-[3px] uppercase text-white/10">Surgical Precision</p>
                        </div>
                      </div>
                    </div>
                  </TiltCard>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-3xl -z-10" style={{ background: "linear-gradient(135deg, rgba(26,107,181,0.08), rgba(42,143,212,0.04))" }} />
                  <div className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl -z-10" style={{ background: "linear-gradient(135deg, rgba(26,107,181,0.06), transparent)" }} />
                </div>
              </Parallax>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          GLOBAL ANIMATIONS
          ═══════════════════════════════════════ */}
      <style>{`
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          25% { transform: translate(var(--drift, 10px), -30px); opacity: 0.8; }
          50% { transform: translate(calc(var(--drift, 10px) * -0.5), -60px); opacity: 0.4; }
          75% { transform: translate(calc(var(--drift, 10px) * 0.7), -30px); opacity: 0.7; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
