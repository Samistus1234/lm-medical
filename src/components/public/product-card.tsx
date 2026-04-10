import Link from "next/link";
import { AddToQuoteButton } from "./add-to-quote-button";

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
  if (qty === 0) return (
    <span className="text-xs px-2 py-0.5 rounded-[4px]" style={{ color: "#ea2261", backgroundColor: "rgba(234,34,97,0.1)", border: "1px solid rgba(234,34,97,0.2)" }}>
      Out of Stock
    </span>
  );
  if (qty <= 5) return (
    <span className="text-xs px-2 py-0.5 rounded-[4px]" style={{ color: "#9b6829", backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
      Low Stock
    </span>
  );
  return (
    <span className="text-xs px-2 py-0.5 rounded-[4px]" style={{ color: "#108c3d", backgroundColor: "rgba(21,190,83,0.1)", border: "1px solid rgba(21,190,83,0.2)" }}>
      In Stock
    </span>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const slug = product.item_code.toLowerCase();

  return (
    <div className="bg-white rounded-[6px] overflow-hidden flex flex-col transition-shadow hover:shadow-[rgba(50,50,93,0.25)_0px_30px_45px_-30px,rgba(0,0,0,0.1)_0px_18px_36px_-18px]"
      style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}>

      <div className="aspect-square bg-[#f8fafc] flex items-center justify-center" style={{ borderBottom: "1px solid #e5edf5" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        </svg>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal" style={{ color: "#1a6bb5" }}>{product.category}</span>
          <StockBadge qty={product.stock_qty} />
        </div>

        <Link href={`/products/${slug}`} className="group">
          <h3 className="text-base font-normal group-hover:text-[#1a6bb5] transition-colors" style={{ color: "#0a1628" }}>
            {product.item_name}
          </h3>
        </Link>

        {product.variant && (
          <p className="text-sm mt-1" style={{ color: "#64748d" }}>{product.variant}</p>
        )}

        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Code: {product.item_code}</p>

        <div className="mt-auto pt-4">
          <AddToQuoteButton product={product} />
        </div>
      </div>
    </div>
  );
}
