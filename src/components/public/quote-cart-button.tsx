"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/quote-cart";

export function QuoteCartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCartCount());

    function handleUpdate() {
      setCount(getCartCount());
    }

    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, []);

  return (
    <Link href="/quote" className="relative p-2" aria-label="Quote cart">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] text-white rounded-full" style={{ backgroundColor: "#1a6bb5" }}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
