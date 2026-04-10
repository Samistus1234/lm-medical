"use client";

import { useEffect, useState } from "react";
import { getCart, updateQuantity, removeFromCart, type CartItem } from "@/lib/quote-cart";

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
      <div className="text-center py-8">
        <p style={{ color: "#64748d" }}>Your quote cart is empty.</p>
        <a href="/products" className="inline-block mt-4 text-sm" style={{ color: "#1a6bb5" }}>Browse Products</a>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}>Product</th>
            <th className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}>Variant</th>
            <th className="text-left px-4 py-3 font-normal w-24" style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}>Qty</th>
            <th className="text-left px-4 py-3 font-normal w-16" style={{ color: "#273951", backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td className="px-4 py-3" style={{ color: "#0a1628", border: "1px solid #e5edf5" }}>
                <div>{item.itemName}</div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>{item.itemCode}</div>
              </td>
              <td className="px-4 py-3" style={{ color: "#64748d", border: "1px solid #e5edf5" }}>{item.variant || "—"}</td>
              <td className="px-4 py-3" style={{ border: "1px solid #e5edf5" }}>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 border rounded-[4px] text-center text-sm"
                  style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                />
              </td>
              <td className="px-4 py-3 text-center" style={{ border: "1px solid #e5edf5" }}>
                <button onClick={() => removeFromCart(item.productId)} className="text-sm" style={{ color: "#ea2261" }}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm" style={{ color: "#64748d" }}>
        {items.length} item{items.length !== 1 ? "s" : ""} in quote
      </p>
    </div>
  );
}
