"use client";

import { useEffect, useState } from "react";
import { getCart, updateQuantity, removeFromCart, type CartItem } from "@/lib/quote-cart";
import { FadeIn } from "@/components/public/animations";

export function QuoteCartDisplay() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
    function handleUpdate() { setItems(getCart()); }
    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* Large package icon */}
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8"
          style={{
            background: "linear-gradient(135deg, rgba(26,107,181,0.08), rgba(42,143,212,0.12))",
            border: "1px solid rgba(26,107,181,0.12)",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a6bb5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <h3
          className="text-2xl mb-3"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            color: "#0a1628",
            letterSpacing: "-0.4px",
          }}
        >
          Your quote cart is empty
        </h3>
        <p className="text-sm mb-8" style={{ color: "#64748d", maxWidth: "320px", textAlign: "center", lineHeight: "1.6" }}>
          Browse our catalog and add products you&apos;d like to receive pricing for.
        </p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-medium rounded-xl transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #1a6bb5, #2a8fd4)",
            boxShadow: "0 4px 20px rgba(26,107,181,0.3)",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,107,181,0.45)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,107,181,0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Browse Catalog
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <FadeIn key={item.productId} delay={index * 0.06} direction="up" distance={20}>
            <div
              className="flex items-stretch rounded-xl overflow-hidden transition-all duration-300 group"
              style={{
                border: "1px solid #e5edf5",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "rgba(26,107,181,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "#e5edf5";
              }}
            >
              {/* Dark gradient product icon area */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "72px",
                  background: "linear-gradient(160deg, #0d1b2a, #1a2d45)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(42,143,212,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>

              {/* Product info */}
              <div className="flex-1 px-5 py-4 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4
                      className="text-sm font-semibold truncate"
                      style={{ color: "#0a1628", lineHeight: "1.4" }}
                    >
                      {item.itemName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                          color: "#1a6bb5",
                          backgroundColor: "rgba(26,107,181,0.08)",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {item.itemCode}
                      </span>
                      {item.variant && (
                        <span className="text-xs" style={{ color: "#64748d" }}>
                          {item.variant}
                        </span>
                      )}
                    </div>
                    {item.category && (
                      <span
                        className="inline-block text-[11px] mt-2 uppercase"
                        style={{ color: "#94a3b8", letterSpacing: "0.8px" }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200"
                    style={{ color: "#94a3b8" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ea2261";
                      e.currentTarget.style.backgroundColor = "rgba(234,34,97,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    title="Remove item"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Quantity control */}
              <div className="flex items-center gap-0 flex-shrink-0 pr-5">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-l-lg text-sm font-medium transition-all duration-200"
                  style={{
                    border: "1px solid #e5edf5",
                    color: "#64748d",
                    backgroundColor: "#f8fafc",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e5edf5";
                    e.currentTarget.style.color = "#0a1628";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.color = "#64748d";
                  }}
                >
                  -
                </button>
                <div
                  className="w-12 h-9 flex items-center justify-center text-sm font-semibold"
                  style={{
                    borderTop: "1px solid #e5edf5",
                    borderBottom: "1px solid #e5edf5",
                    color: "#0a1628",
                    backgroundColor: "#ffffff",
                  }}
                >
                  {item.quantity}
                </div>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-r-lg text-sm font-medium transition-all duration-200"
                  style={{
                    border: "1px solid #e5edf5",
                    color: "#64748d",
                    backgroundColor: "#f8fafc",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e5edf5";
                    e.currentTarget.style.color = "#0a1628";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.color = "#64748d";
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Item count summary */}
      <div className="mt-6 pt-5" style={{ borderTop: "1px solid #e5edf5" }}>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#64748d" }}>
            {items.length} product{items.length !== 1 ? "s" : ""} selected
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: "#0a1628" }}
          >
            {items.reduce((sum, i) => sum + i.quantity, 0)} total units
          </span>
        </div>
      </div>
    </div>
  );
}
