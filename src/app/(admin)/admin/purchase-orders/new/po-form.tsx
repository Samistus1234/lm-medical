"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPurchaseOrder } from "../actions";

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  item_code: string;
  item_name: string;
  variant: string | null;
  category: string;
  stock_qty: number;
  cost_price_usd: number;
  supplier_id: string | null;
}

interface POItem {
  productId: string;
  product: Product;
  quantity: number;
  unitCost: number;
}

interface POFormProps {
  suppliers: Supplier[];
  products: Product[];
}

export function POForm({ suppliers, products }: POFormProps) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<POItem[]>([]);
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  // Products available to add (not already in the items list)
  const addedIds = new Set(items.map((i) => i.productId));

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const s = search.toLowerCase();
    return products
      .filter(
        (p) =>
          !addedIds.has(p.id) &&
          (p.item_code.toLowerCase().includes(s) ||
            p.item_name.toLowerCase().includes(s) ||
            (p.variant && p.variant.toLowerCase().includes(s)))
      )
      .slice(0, 8);
  }, [search, products, addedIds]);

  function handleSupplierChange(newSupplierId: string) {
    setSupplierId(newSupplierId);
    if (!newSupplierId) {
      setItems([]);
      return;
    }
    // Auto-populate low stock items for this supplier
    const lowStock = products.filter(
      (p) => p.supplier_id === newSupplierId && p.stock_qty <= 5
    );
    setItems(
      lowStock.map((p) => ({
        productId: p.id,
        product: p,
        quantity: 10,
        unitCost: p.cost_price_usd || 0,
      }))
    );
  }

  function addProduct(product: Product) {
    if (addedIds.has(product.id)) return;
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        product,
        quantity: 10,
        unitCost: product.cost_price_usd || 0,
      },
    ]);
    setSearch("");
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateItem(productId: string, field: "quantity" | "unitCost", value: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, [field]: value } : i))
    );
  }

  function stockColor(qty: number): string {
    if (qty === 0) return "#dc2626";
    if (qty <= 5) return "#ea580c";
    return "#0a1628";
  }

  async function handleSubmit() {
    if (!supplierId) {
      setError("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one item");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result = await createPurchaseOrder(
        supplierId,
        items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
        }))
      );
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
      } else {
        router.push("/admin/purchase-orders");
      }
    } catch {
      setError("Failed to create purchase order");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Supplier Selection */}
      <div>
        <label className="block text-sm mb-1" style={{ color: "#273951" }}>
          Supplier *
        </label>
        <select
          value={supplierId}
          onChange={(e) => handleSupplierChange(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        >
          <option value="">Select a supplier...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      {items.length > 0 && (
        <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Product", "Current Stock", "Reorder Qty", "Unit Cost (USD)", "Line Total", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-3 font-normal whitespace-nowrap"
                      style={{
                        color: "#273951",
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e5edf5",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId} style={{ borderBottom: "1px solid #e5edf5" }}>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs" style={{ color: "#1a6bb5" }}>
                      {item.product.item_code}
                    </span>{" "}
                    <span style={{ color: "#0a1628" }}>{item.product.item_name}</span>
                    {item.product.variant && (
                      <span style={{ color: "#64748d" }}> - {item.product.variant}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className="font-medium"
                      style={{ color: stockColor(item.product.stock_qty) }}
                    >
                      {item.product.stock_qty}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.productId, "quantity", parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-2 py-1 border rounded-[4px] text-sm text-center focus:outline-none focus:border-[#1a6bb5]"
                      style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitCost}
                      onChange={(e) =>
                        updateItem(item.productId, "unitCost", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 border rounded-[4px] text-sm text-center focus:outline-none focus:border-[#1a6bb5]"
                      style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                    />
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: "#0a1628" }}>
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-lg leading-none px-1 rounded hover:bg-red-50 transition-colors"
                      style={{ color: "#dc2626" }}
                      title="Remove item"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Search */}
      <div className="relative">
        <label className="block text-sm mb-1" style={{ color: "#273951" }}>
          Add Product
        </label>
        <input
          type="text"
          placeholder="Search by code or name to add..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        />
        {searchResults.length > 0 && (
          <div
            className="absolute z-10 mt-1 w-full max-w-md rounded-[4px] shadow-lg overflow-hidden"
            style={{ border: "1px solid #e5edf5", backgroundColor: "#fff" }}
          >
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => addProduct(p)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#e8f4fd] transition-colors flex items-center justify-between"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <span>
                  <span className="font-mono text-xs" style={{ color: "#1a6bb5" }}>
                    {p.item_code}
                  </span>{" "}
                  <span style={{ color: "#0a1628" }}>{p.item_name}</span>
                  {p.variant && <span style={{ color: "#64748d" }}> - {p.variant}</span>}
                </span>
                <span className="text-xs" style={{ color: stockColor(p.stock_qty) }}>
                  Stock: {p.stock_qty}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm mb-1" style={{ color: "#273951" }}>
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional notes for this purchase order..."
          className="w-full max-w-md px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] resize-none"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        />
      </div>

      {/* Subtotal & Submit */}
      <div className="flex items-center justify-between max-w-md">
        <div>
          <span className="text-sm" style={{ color: "#64748d" }}>
            Subtotal:
          </span>{" "}
          <span className="text-lg font-medium" style={{ color: "#0a1628" }}>
            ${subtotal.toFixed(2)}
          </span>
          <span className="text-xs ml-2" style={{ color: "#64748d" }}>
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || items.length === 0}
          className="px-6 py-2 text-sm text-white rounded-[4px] disabled:opacity-50"
          style={{ backgroundColor: "#1a6bb5" }}
        >
          {submitting ? "Creating..." : "Create Draft PO"}
        </button>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}
