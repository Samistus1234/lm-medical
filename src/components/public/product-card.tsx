"use client";

import Link from "next/link";
import { AddToQuoteButton } from "@/components/public/add-to-quote-button";
import { TiltCard } from "@/components/public/animations";

interface ProductCardProps {
  product: {
    id: string;
    item_code: string;
    item_name: string;
    variant: string | null;
    category: string;
    stock_qty: number;
    images: string[];
  };
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0)
    return (
      <span
        className="text-[11px] font-medium px-2.5 py-1 rounded-full tracking-wide uppercase"
        style={{
          color: "#ea2261",
          backgroundColor: "rgba(234,34,97,0.08)",
          border: "1px solid rgba(234,34,97,0.15)",
        }}
      >
        Out of Stock
      </span>
    );
  if (qty <= 5)
    return (
      <span
        className="text-[11px] font-medium px-2.5 py-1 rounded-full tracking-wide uppercase"
        style={{
          color: "#9b6829",
          backgroundColor: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.15)",
        }}
      >
        Low Stock
      </span>
    );
  return (
    <span
      className="text-[11px] font-medium px-2.5 py-1 rounded-full tracking-wide uppercase"
      style={{
        color: "#108c3d",
        backgroundColor: "rgba(21,190,83,0.06)",
        border: "1px solid rgba(21,190,83,0.15)",
        boxShadow: "0 0 12px rgba(21,190,83,0.1)",
      }}
    >
      In Stock
    </span>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const slug = product.item_code.toLowerCase();

  return (
    <TiltCard intensity={8} glare className="relative rounded-2xl overflow-hidden">
      <div
        className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2"
        style={{
          border: "1px solid #e5edf5",
          boxShadow: "rgba(23,23,23,0.04) 0px 4px 12px",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow =
            "rgba(26,107,181,0.12) 0px 32px 64px -16px, rgba(0,0,0,0.08) 0px 16px 32px -16px";
          el.style.borderBottomColor = "#1a6bb5";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = "rgba(23,23,23,0.04) 0px 4px 12px";
          el.style.borderBottomColor = "#e5edf5";
        }}
      >
        {/* Product Image Area */}
        <div
          className="aspect-[4/3] relative flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a1628 0%, #132040 50%, #0d1a30 100%)",
          }}
        >
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.item_name}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(42,143,212,0.6)"
                strokeWidth="0.8"
                className="relative z-10"
              >
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category + Stock */}
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#1a6bb5" }}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#1a6bb5" }}
              />
              {product.category}
            </span>
            <StockBadge qty={product.stock_qty} />
          </div>

          {/* Name */}
          <Link href={`/products/${slug}`} className="group/link">
            <h3
              className="text-[15px] font-medium leading-snug transition-colors duration-300 group-hover/link:text-[#1a6bb5]"
              style={{
                color: "#0a1628",
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              }}
            >
              {product.item_name}
            </h3>
          </Link>

          {product.variant && (
            <p className="text-sm mt-1" style={{ color: "#64748d" }}>
              {product.variant}
            </p>
          )}

          {/* Item code */}
          <p
            className="text-[11px] mt-1.5 font-mono"
            style={{ color: "#94a3b8", opacity: 0.7 }}
          >
            {product.item_code}
          </p>

          {/* CTA */}
          <div className="mt-auto pt-5">
            <AddToQuoteButton
              product={product}
              className="w-full relative overflow-hidden px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-300 hover:shadow-[0_8px_24px_rgba(26,107,181,0.3)]"
            />
          </div>
        </div>

        {/* Bottom border glow on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{
            background: "linear-gradient(90deg, transparent, #1a6bb5, #2a8fd4, #1a6bb5, transparent)",
          }}
        />
      </div>
    </TiltCard>
  );
}
