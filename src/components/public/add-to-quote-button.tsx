"use client";

import { useState } from "react";
import { addToCart } from "@/lib/quote-cart";

interface AddToQuoteButtonProps {
  product: {
    id: string;
    item_code: string;
    item_name: string;
    variant: string | null;
    category: string;
  };
  className?: string;
}

export function AddToQuoteButton({ product, className }: AddToQuoteButtonProps) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart({
      productId: product.id,
      itemCode: product.item_code,
      itemName: product.item_name,
      variant: product.variant,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className={className || "px-4 py-2 text-sm text-white rounded-[4px] transition-colors"}
      style={{ backgroundColor: added ? "#15be53" : "#1a6bb5" }}
    >
      {added ? "Added!" : "Add to Quote"}
    </button>
  );
}
