"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Modal } from "@/components/admin/modal";
import { updateProduct, createProduct } from "./actions";

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  item_code: string;
  item_name: string;
  category: string;
  variant: string | null;
  supplier_id: string | null;
  suppliers: { name: string } | null;
  stock_qty: number;
  cost_price_sdg: number;
  sale_price_sdg: number;
  cost_price_usd: number;
  sale_price_usd: number;
  is_active: boolean;
}

interface InventoryTableProps {
  products: Product[];
  categories: string[];
  suppliers: Supplier[];
}

export function InventoryTable({ products, categories, suppliers }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);

  const filtered = products.filter((p) => {
    if (!p.is_active) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (stockFilter === "out" && p.stock_qty > 0) return false;
    if (stockFilter === "low" && (p.stock_qty === 0 || p.stock_qty > 5)) return false;
    if (stockFilter === "in" && p.stock_qty <= 0) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.item_code.toLowerCase().includes(s) || p.item_name.toLowerCase().includes(s);
    }
    return true;
  });

  async function handleInlineEdit(id: string, field: string, value: string) {
    const numValue = field === "stock_qty" ? parseInt(value) : parseFloat(value);
    if (isNaN(numValue)) return;
    await updateProduct(id, { [field]: numValue });
    setEditingCell(null);
  }

  function EditableCell({ product, field }: { product: Product; field: keyof Product }) {
    const isEditing = editingCell?.id === product.id && editingCell?.field === field;
    const value = product[field];

    if (isEditing) {
      return (
        <input
          type="number"
          defaultValue={String(value)}
          autoFocus
          onBlur={(e) => handleInlineEdit(product.id, field, e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          className="w-20 px-1 py-0.5 border rounded text-sm text-center"
          style={{ borderColor: "#1a6bb5", color: "#0a1628" }}
        />
      );
    }

    return (
      <span
        className="cursor-pointer px-1 py-0.5 rounded hover:bg-[#e8f4fd] transition-colors"
        onClick={() => setEditingCell({ id: product.id, field })}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-[4px] text-sm w-64 focus:outline-none focus:border-[#1a6bb5]"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        >
          <option value="">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock (≤5)</option>
          <option value="out">Out of Stock</option>
        </select>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm text-white rounded-[4px] ml-auto"
          style={{ backgroundColor: "#1a6bb5" }}
        >
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Code", "Name", "Category", "Variant", "Supplier", "Stock", "Cost (SDG)", "Sale (SDG)", "Cost (USD)", "Sale (USD)"].map((h) => (
                <th key={h} className="text-left px-3 py-3 font-normal whitespace-nowrap" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-3 py-2 font-mono text-xs" style={{ color: "#1a6bb5" }}>{p.item_code}</td>
                <td className="px-3 py-2" style={{ color: "#0a1628" }}>{p.item_name}</td>
                <td className="px-3 py-2" style={{ color: "#64748d" }}>{p.category}</td>
                <td className="px-3 py-2" style={{ color: "#64748d" }}>{p.variant || "—"}</td>
                <td className="px-3 py-2">
                  <select
                    value={p.supplier_id || ""}
                    onChange={async (e) => {
                      await updateProduct(p.id, { supplier_id: e.target.value || null });
                    }}
                    className="w-full px-1 py-0.5 border rounded text-sm cursor-pointer bg-white hover:border-[#1a6bb5] transition-colors"
                    style={{ borderColor: p.supplier_id ? "#1a6bb5" : "#e5edf5", color: p.supplier_id ? "#0a1628" : "#94a3b8", minWidth: "140px" }}
                  >
                    <option value="">— Select —</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2"><EditableCell product={p} field="stock_qty" /></td>
                <td className="px-3 py-2"><EditableCell product={p} field="cost_price_sdg" /></td>
                <td className="px-3 py-2"><EditableCell product={p} field="sale_price_sdg" /></td>
                <td className="px-3 py-2"><EditableCell product={p} field="cost_price_usd" /></td>
                <td className="px-3 py-2"><EditableCell product={p} field="sale_price_usd" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>{filtered.length} of {products.filter(p => p.is_active).length} products</p>

      {/* Add Product Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Product">
        <form action={async (formData) => { await createProduct(formData); setShowAdd(false); }} className="space-y-4">
          {[
            { name: "item_code", label: "Item Code", required: true },
            { name: "item_name", label: "Item Name", required: true },
            { name: "category", label: "Category", required: true },
            { name: "variant", label: "Variant / Size" },
            { name: "stock_qty", label: "Stock Qty", type: "number" },
            { name: "cost_price_sdg", label: "Cost Price (SDG)", type: "number" },
            { name: "sale_price_sdg", label: "Sale Price (SDG)", type: "number" },
            { name: "cost_price_usd", label: "Cost Price (USD)", type: "number" },
            { name: "sale_price_usd", label: "Sale Price (USD)", type: "number" },
            { name: "notes", label: "Notes" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm mb-1" style={{ color: "#273951" }}>{f.label}{f.required && " *"}</label>
              <input name={f.name} type={f.type || "text"} required={f.required} className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
            </div>
          ))}
          <div>
            <label className="block text-sm mb-1" style={{ color: "#273951" }}>Supplier</label>
            <select name="supplier_id" className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
              <option value="">No Supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Add Product</button>
        </form>
      </Modal>
    </>
  );
}
