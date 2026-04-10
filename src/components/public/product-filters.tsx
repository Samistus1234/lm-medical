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
    <div className="space-y-8">
      {/* Search */}
      <div>
        <div className="relative">
          {/* Search icon */}
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "#64748d" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search instruments..."
            defaultValue={currentSearch}
            onChange={(e) => {
              clearTimeout((window as any).__searchTimeout);
              (window as any).__searchTimeout = setTimeout(() => {
                updateParams("search", e.target.value);
              }, 300);
            }}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl focus:outline-none transition-all duration-300 placeholder:text-[#64748d]"
            style={{
              backgroundColor: "rgba(10,22,40,0.04)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(229,237,245,0.8)",
              color: "#0a1628",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#1a6bb5";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 2px rgba(0,0,0,0.04), 0 0 0 3px rgba(26,107,181,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(229,237,245,0.8)";
              e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.04)";
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4"
          style={{ color: "#64748d" }}
        >
          Categories
        </h3>
        <div className="space-y-1">
          {/* All Products */}
          <button
            onClick={() => updateParams("category", "")}
            className="flex items-center gap-3 w-full text-left px-3.5 py-2.5 text-sm rounded-xl transition-all duration-300"
            style={
              !currentCategory
                ? {
                    backgroundColor: "rgba(26,107,181,0.08)",
                    color: "#1a6bb5",
                    borderLeft: "3px solid #1a6bb5",
                    boxShadow: "inset 0 0 12px rgba(26,107,181,0.06)",
                  }
                : {
                    color: "#0a1628",
                    borderLeft: "3px solid transparent",
                  }
            }
          >
            {/* Grid icon */}
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: !currentCategory ? "#1a6bb5" : "#94a3b8" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="font-medium">All Products</span>
          </button>

          {categories.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => updateParams("category", cat)}
                className="flex items-center gap-3 w-full text-left px-3.5 py-2.5 text-sm rounded-xl transition-all duration-300"
                style={
                  isActive
                    ? {
                        backgroundColor: "rgba(26,107,181,0.08)",
                        color: "#1a6bb5",
                        borderLeft: "3px solid #1a6bb5",
                        boxShadow: "inset 0 0 12px rgba(26,107,181,0.06)",
                      }
                    : {
                        color: "#0a1628",
                        borderLeft: "3px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(10,22,40,0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? "#1a6bb5" : "#d1dae5",
                    boxShadow: isActive ? "0 0 8px rgba(26,107,181,0.4)" : "none",
                  }}
                />
                <span className={isActive ? "font-medium" : ""}>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
