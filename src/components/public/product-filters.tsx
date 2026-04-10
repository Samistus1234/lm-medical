"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ProductFiltersProps {
  categories: string[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search products..."
          defaultValue={currentSearch}
          onChange={(e) => {
            clearTimeout((window as any).__searchTimeout);
            (window as any).__searchTimeout = setTimeout(() => {
              updateParams("search", e.target.value);
            }, 300);
          }}
          className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5] placeholder:text-[#94a3b8]"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        />
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-normal mb-3" style={{ color: "#273951" }}>Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParams("category", "")}
            className={`block w-full text-left px-3 py-1.5 text-sm rounded-[4px] transition-colors ${
              !currentCategory ? "text-white" : "hover:bg-[#f1f5f9]"
            }`}
            style={!currentCategory ? { backgroundColor: "#1a6bb5" } : { color: "#0a1628" }}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParams("category", cat)}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded-[4px] transition-colors ${
                currentCategory === cat ? "text-white" : "hover:bg-[#f1f5f9]"
              }`}
              style={currentCategory === cat ? { backgroundColor: "#1a6bb5" } : { color: "#0a1628" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
