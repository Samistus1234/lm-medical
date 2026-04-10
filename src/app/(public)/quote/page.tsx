"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuoteCartDisplay } from "@/components/public/quote-cart";
import { getCart, clearCart } from "@/lib/quote-cart";
import { submitQuote } from "./actions";
import { FadeIn, FloatingParticles, Magnetic, TextReveal, LineReveal } from "@/components/public/animations";

export default function QuotePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("USD");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cart = getCart();
    if (cart.length === 0) {
      setError("Your quote cart is empty. Add products first.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("currency", currency);
    formData.set("cart_items", JSON.stringify(
      cart.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    ));

    const result = await submitQuote(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    clearCart();
    router.push(`/quote/success?number=${result.quoteNumber}`);
  }

  return (
    <div>
      {/* ═══ CINEMATIC HERO ═══ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(165deg, #0a1628 0%, #0d1b2a 40%, #132940 100%)",
          minHeight: "340px",
        }}
      >
        <FloatingParticles count={40} color="rgba(42,143,212,0.12)" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(42,143,212,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(42,143,212,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient orbs */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "-200px",
            right: "-100px",
            background: "radial-gradient(circle, rgba(26,107,181,0.15) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "400px",
            height: "400px",
            bottom: "-150px",
            left: "-100px",
            background: "radial-gradient(circle, rgba(42,143,212,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <FadeIn delay={0.1} direction="up" distance={30}>
            <p
              className="text-xs font-medium uppercase mb-5"
              style={{ color: "#2a8fd4", letterSpacing: "3px" }}
            >
              Medical Equipment Solutions
            </p>
          </FadeIn>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              color: "#ffffff",
              letterSpacing: "-1px",
              lineHeight: "1.15",
            }}
          >
            <TextReveal text="Request a Quote" delay={0.2} stagger={0.06} mode="word" />
          </h1>

          <FadeIn delay={0.6} direction="up" distance={20}>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.5)", lineHeight: "1.7" }}
            >
              Review your selected products, provide your details, and our team will prepare a comprehensive quote tailored to your requirements.
            </p>
          </FadeIn>

          {/* Progress Steps */}
          <FadeIn delay={0.8} direction="up" distance={20}>
            <div className="flex items-center justify-center gap-4 sm:gap-8 mt-12">
              {[
                { num: "1", label: "Review Products" },
                { num: "2", label: "Your Details" },
                { num: "3", label: "Submit" },
              ].map((step, i) => (
                <div key={step.num} className="flex items-center gap-3 sm:gap-4">
                  {i > 0 && (
                    <div
                      className="hidden sm:block"
                      style={{
                        width: "40px",
                        height: "1px",
                        background: "linear-gradient(90deg, transparent, rgba(42,143,212,0.3), transparent)",
                      }}
                    />
                  )}
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        background: "rgba(26,107,181,0.15)",
                        border: "1px solid rgba(42,143,212,0.3)",
                        color: "#2a8fd4",
                      }}
                    >
                      {step.num}
                    </div>
                    <span
                      className="text-xs uppercase hidden sm:inline"
                      style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to top, #f8fafc, transparent)" }}
        />
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 pb-24"
        style={{ marginTop: "-32px" }}
      >
        {/* Error State */}
        {error && (
          <FadeIn direction="up" distance={10}>
            <div
              className="mb-8 rounded-xl px-6 py-5 flex items-start gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(234,34,97,0.06), rgba(234,34,97,0.03))",
                border: "1px solid rgba(234,34,97,0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "rgba(234,34,97,0.1)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea2261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#ea2261" }}>
                  Something went wrong
                </p>
                <p className="text-sm" style={{ color: "rgba(234,34,97,0.8)" }}>
                  {error}
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ═══ SECTION 1: YOUR SELECTION ═══ */}
          <div className="lg:col-span-7">
            <FadeIn delay={0.1} direction="up" distance={30}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5edf5",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                }}
              >
                {/* Section header */}
                <div
                  className="px-7 py-5 flex items-center gap-4"
                  style={{ borderBottom: "1px solid #e5edf5" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #0d1b2a, #1a2d45)",
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: "#2a8fd4" }}>1</span>
                  </div>
                  <div>
                    <h2
                      className="text-xl font-light"
                      style={{
                        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                        color: "#0a1628",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      Your Selection
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      Review and adjust quantities
                    </p>
                  </div>
                </div>

                {/* Cart content */}
                <div className="p-6">
                  <QuoteCartDisplay />
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ═══ SECTION 2: CONTACT INFORMATION ═══ */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.2} direction="up" distance={30}>
              <div
                className="rounded-2xl overflow-hidden lg:sticky lg:top-8"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5edf5",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                }}
              >
                {/* Section header */}
                <div
                  className="px-7 py-5 flex items-center gap-4"
                  style={{ borderBottom: "1px solid #e5edf5" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #0d1b2a, #1a2d45)",
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: "#2a8fd4" }}>2</span>
                  </div>
                  <div>
                    <h2
                      className="text-xl font-light"
                      style={{
                        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                        color: "#0a1628",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      Contact Information
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      How can we reach you?
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="p-7">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        className="block text-[11px] font-medium uppercase mb-2"
                        style={{ color: "#64748d", letterSpacing: "1.2px" }}
                      >
                        Full Name *
                      </label>
                      <input
                        name="contact_name"
                        required
                        placeholder="Dr. John Smith"
                        className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-300 outline-none"
                        style={{
                          border: "1px solid #e5edf5",
                          color: "#0a1628",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#1a6bb5";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,107,181,0.1)";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e5edf5";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        className="block text-[11px] font-medium uppercase mb-2"
                        style={{ color: "#64748d", letterSpacing: "1.2px" }}
                      >
                        Email Address *
                      </label>
                      <input
                        name="contact_email"
                        type="email"
                        required
                        placeholder="john@hospital.org"
                        className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-300 outline-none"
                        style={{
                          border: "1px solid #e5edf5",
                          color: "#0a1628",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#1a6bb5";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,107,181,0.1)";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e5edf5";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        className="block text-[11px] font-medium uppercase mb-2"
                        style={{ color: "#64748d", letterSpacing: "1.2px" }}
                      >
                        Phone Number
                      </label>
                      <input
                        name="contact_phone"
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-300 outline-none"
                        style={{
                          border: "1px solid #e5edf5",
                          color: "#0a1628",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#1a6bb5";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,107,181,0.1)";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e5edf5";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                      />
                    </div>

                    {/* Organization */}
                    <div>
                      <label
                        className="block text-[11px] font-medium uppercase mb-2"
                        style={{ color: "#64748d", letterSpacing: "1.2px" }}
                      >
                        Organization
                      </label>
                      <input
                        name="organization"
                        placeholder="Hospital / Clinic name"
                        className="w-full px-4 py-3.5 rounded-xl text-sm transition-all duration-300 outline-none"
                        style={{
                          border: "1px solid #e5edf5",
                          color: "#0a1628",
                          backgroundColor: "#f8fafc",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#1a6bb5";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,107,181,0.1)";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e5edf5";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                      />
                    </div>

                    {/* Divider */}
                    <LineReveal delay={0.3} color="rgba(229,237,245,0.8)" height={1} />

                    {/* Currency Toggle */}
                    <div>
                      <label
                        className="block text-[11px] font-medium uppercase mb-3"
                        style={{ color: "#64748d", letterSpacing: "1.2px" }}
                      >
                        Preferred Currency
                      </label>
                      <input type="hidden" name="currency" value={currency} />
                      <div className="flex gap-2">
                        {["USD", "SDG"].map((cur) => (
                          <button
                            key={cur}
                            type="button"
                            onClick={() => setCurrency(cur)}
                            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                            style={{
                              backgroundColor: currency === cur ? "#1a6bb5" : "transparent",
                              color: currency === cur ? "#ffffff" : "#64748d",
                              border: currency === cur ? "1px solid #1a6bb5" : "1px solid #e5edf5",
                              boxShadow: currency === cur ? "0 4px 12px rgba(26,107,181,0.25)" : "none",
                            }}
                          >
                            {cur === "USD" ? "USD ($)" : "SDG (SDG)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        className="block text-[11px] font-medium uppercase mb-2"
                        style={{ color: "#64748d", letterSpacing: "1.2px" }}
                      >
                        Additional Notes
                      </label>
                      <textarea
                        name="notes"
                        rows={4}
                        placeholder="Special requirements, delivery preferences, urgency..."
                        className="w-full px-4 py-4 rounded-xl text-sm transition-all duration-300 outline-none resize-none"
                        style={{
                          border: "1px solid #e5edf5",
                          color: "#0a1628",
                          backgroundColor: "#f8fafc",
                          lineHeight: "1.7",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#1a6bb5";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,107,181,0.1)";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e5edf5";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <Magnetic strength={0.15}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-white text-sm font-semibold uppercase rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        style={{
                          background: loading
                            ? "#94a3b8"
                            : "linear-gradient(135deg, #1a6bb5, #2a8fd4)",
                          boxShadow: loading
                            ? "none"
                            : "0 4px 20px rgba(26,107,181,0.35)",
                          letterSpacing: "1.5px",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,107,181,0.5)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,107,181,0.35)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="3"
                              />
                              <path
                                d="M12 2a10 10 0 019.95 9"
                                stroke="#ffffff"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            Submit Quote Request
                          </>
                        )}
                      </button>
                    </Magnetic>

                    {/* Trust note */}
                    <p className="text-center text-[11px] mt-4" style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                      Your information is secure. We typically respond within 24-48 hours.
                    </p>
                  </form>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
