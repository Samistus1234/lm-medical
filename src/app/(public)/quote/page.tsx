"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuoteCartDisplay } from "@/components/public/quote-cart";
import { getCart, clearCart } from "@/lib/quote-cart";
import { submitQuote } from "./actions";

export default function QuotePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-light mb-2" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
        Request a Quote
      </h1>
      <p className="mb-8" style={{ color: "#64748d" }}>
        Review your selected products and submit your details. Our team will respond with pricing.
      </p>

      {/* Cart Display */}
      <div className="bg-white rounded-[6px] p-6 mb-8" style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}>
        <h2 className="text-xl font-light mb-4" style={{ color: "#0a1628", letterSpacing: "-0.22px" }}>
          Selected Products
        </h2>
        <QuoteCartDisplay />
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}>
        <h2 className="text-xl font-light mb-4" style={{ color: "#0a1628", letterSpacing: "-0.22px" }}>
          Contact Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-[#ea2261] rounded-[4px] px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal mb-1.5" style={{ color: "#273951" }}>Name *</label>
              <input name="contact_name" required className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
            </div>
            <div>
              <label className="block text-sm font-normal mb-1.5" style={{ color: "#273951" }}>Email *</label>
              <input name="contact_email" type="email" required className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
            </div>
            <div>
              <label className="block text-sm font-normal mb-1.5" style={{ color: "#273951" }}>Phone</label>
              <input name="contact_phone" className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
            </div>
            <div>
              <label className="block text-sm font-normal mb-1.5" style={{ color: "#273951" }}>Organization</label>
              <input name="organization" className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-normal mb-1.5" style={{ color: "#273951" }}>Preferred Currency</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm" style={{ color: "#0a1628" }}>
                <input type="radio" name="currency" value="USD" defaultChecked className="accent-[#1a6bb5]" /> USD
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: "#0a1628" }}>
                <input type="radio" name="currency" value="SDG" className="accent-[#1a6bb5]" /> SDG
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-normal mb-1.5" style={{ color: "#273951" }}>Notes</label>
            <textarea name="notes" rows={3} className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} placeholder="Any special requirements or notes..." />
          </div>

          <button type="submit" disabled={loading} className="px-8 py-3 text-white rounded-[4px] transition-colors disabled:opacity-50" style={{ backgroundColor: "#1a6bb5" }}>
            {loading ? "Submitting..." : "Submit Quote Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
