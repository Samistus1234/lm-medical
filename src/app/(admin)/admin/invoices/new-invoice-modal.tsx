"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/admin/modal";
import { createClient } from "@/lib/supabase/client";
import { createStandaloneInvoice } from "./actions";

interface CustomerLite {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
}

interface ProductLite {
  id: string;
  item_code: string;
  item_name: string;
  variant: string | null;
  sale_price_usd: number;
  sale_price_sdg: number;
}

interface ItemRow {
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
}

const blankRow = (): ItemRow => ({ product_id: null, description: "", quantity: 1, unit_price: 0 });

export function NewInvoiceModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [customers, setCustomers] = useState<CustomerLite[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", contact_person: "", email: "", phone: "" });

  const [currency, setCurrency] = useState<"USD" | "SDG">("USD");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [items, setItems] = useState<ItemRow[]>([blankRow()]);
  const [sendNow, setSendNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || loaded) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("customers").select("id, name, contact_person, phone").order("name"),
      supabase
        .from("products")
        .select("id, item_code, item_name, variant, sale_price_usd, sale_price_sdg")
        .eq("is_active", true)
        .order("item_name"),
    ]).then(([c, p]) => {
      setCustomers((c.data as CustomerLite[]) || []);
      setProducts((p.data as ProductLite[]) || []);
      setLoaded(true);
    });
  }, [open, loaded]);

  const filteredCustomers = useMemo(() => {
    const s = customerSearch.toLowerCase();
    if (!s) return customers.slice(0, 50);
    return customers.filter((c) => c.name.toLowerCase().includes(s) || c.contact_person?.toLowerCase().includes(s)).slice(0, 50);
  }, [customers, customerSearch]);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0),
    [items]
  );

  function updateItem(idx: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function pickProduct(idx: number, productId: string) {
    const p = products.find((pp) => pp.id === productId);
    if (!p) {
      updateItem(idx, { product_id: null });
      return;
    }
    const price = currency === "USD" ? p.sale_price_usd : p.sale_price_sdg;
    updateItem(idx, {
      product_id: p.id,
      description: `${p.item_name}${p.variant ? ` — ${p.variant}` : ""} (${p.item_code})`,
      unit_price: Number(price) || 0,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const validItems = items.filter((it) => (it.product_id || it.description.trim()) && it.quantity > 0);
    if (validItems.length === 0) {
      setError("Add at least one line item");
      setSubmitting(false);
      return;
    }

    const result = await createStandaloneInvoice({
      customer_id: customerMode === "existing" ? customerId || null : null,
      new_customer: customerMode === "new" ? newCustomer : undefined,
      currency,
      due_date: dueDate,
      items: validItems.map((it) => ({
        product_id: it.product_id,
        description: it.description.trim() || null,
        quantity: Number(it.quantity) || 0,
        unit_price: Number(it.unit_price) || 0,
      })),
      send_now: sendNow,
    });

    setSubmitting(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    onCreated();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Invoice">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748d" }}>Customer</label>
          <div className="flex gap-2 mb-3 text-xs">
            <button
              type="button"
              onClick={() => setCustomerMode("existing")}
              className="px-3 py-1.5 rounded-[4px]"
              style={{
                backgroundColor: customerMode === "existing" ? "#1a6bb5" : "#f8fafc",
                color: customerMode === "existing" ? "white" : "#64748d",
                border: "1px solid " + (customerMode === "existing" ? "#1a6bb5" : "#e5edf5"),
              }}
            >
              Existing
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode("new")}
              className="px-3 py-1.5 rounded-[4px]"
              style={{
                backgroundColor: customerMode === "new" ? "#1a6bb5" : "#f8fafc",
                color: customerMode === "new" ? "white" : "#64748d",
                border: "1px solid " + (customerMode === "new" ? "#1a6bb5" : "#e5edf5"),
              }}
            >
              New
            </button>
          </div>

          {customerMode === "existing" ? (
            <>
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-[4px] text-sm mb-2 focus:outline-none focus:border-[#1a6bb5]"
                style={{ borderColor: "#e5edf5", color: "#0a1628" }}
              />
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
                style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                required={customerMode === "existing"}
              >
                <option value="">— Select customer —</option>
                {filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.contact_person ? ` (${c.contact_person})` : ""}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="space-y-2">
              <input
                required
                type="text"
                placeholder="Organization / Customer Name *"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
                style={{ borderColor: "#e5edf5", color: "#0a1628" }}
              />
              <input
                type="text"
                placeholder="Contact person"
                value={newCustomer.contact_person}
                onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
                className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
                style={{ borderColor: "#e5edf5", color: "#0a1628" }}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
                  style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                />
                <input
                  type="tel"
                  placeholder="WhatsApp phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
                  style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Currency + Due date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748d" }}>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "USD" | "SDG")}
              className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
              style={{ borderColor: "#e5edf5", color: "#0a1628" }}
            >
              <option value="USD">USD</option>
              <option value="SDG">SDG</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748d" }}>Due Date</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
              style={{ borderColor: "#e5edf5", color: "#0a1628" }}
            />
          </div>
        </div>

        {/* Line items */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#64748d" }}>Line Items</label>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-[4px] p-3 space-y-2" style={{ border: "1px solid #e5edf5", backgroundColor: "#f8fafc" }}>
                <select
                  value={it.product_id || ""}
                  onChange={(e) => pickProduct(idx, e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-[4px] text-xs focus:outline-none focus:border-[#1a6bb5]"
                  style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                >
                  <option value="">— Pick product or enter custom description —</option>
                  {products.slice(0, 200).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.item_code} — {p.item_name}{p.variant ? ` (${p.variant})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={it.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded-[4px] text-xs focus:outline-none focus:border-[#1a6bb5]"
                  style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                />
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="text-[10px]" style={{ color: "#94a3b8" }}>Qty</label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border rounded-[4px] text-xs focus:outline-none focus:border-[#1a6bb5]"
                      style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px]" style={{ color: "#94a3b8" }}>Unit Price</label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={it.unit_price}
                      onChange={(e) => updateItem(idx, { unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border rounded-[4px] text-xs focus:outline-none focus:border-[#1a6bb5]"
                      style={{ borderColor: "#e5edf5", color: "#0a1628" }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] block" style={{ color: "#94a3b8" }}>Total</span>
                    <span className="text-sm" style={{ color: "#0a1628" }}>{((it.quantity || 0) * (it.unit_price || 0)).toLocaleString()} {currency}</span>
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="text-xs"
                    style={{ color: "#ea2261" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setItems([...items, blankRow()])}
            className="mt-2 text-xs px-3 py-1.5 rounded-[4px]"
            style={{ color: "#1a6bb5", border: "1px dashed #1a6bb5" }}
          >
            + Add line item
          </button>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center px-4 py-3 rounded-[4px]" style={{ backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}>
          <span className="text-sm" style={{ color: "#64748d" }}>Total</span>
          <span className="text-lg font-medium" style={{ color: "#0a1628" }}>
            {subtotal.toLocaleString()} {currency}
          </span>
        </div>

        {/* Send now */}
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#273951" }}>
          <input
            type="checkbox"
            checked={sendNow}
            onChange={(e) => setSendNow(e.target.checked)}
          />
          Send WhatsApp invoice + PDF immediately
        </label>

        {error && (
          <div className="px-3 py-2 rounded-[4px] text-sm" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2 text-sm rounded-[4px]"
            style={{ color: "#64748d", border: "1px solid #e5edf5" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 text-sm text-white rounded-[4px]"
            style={{ backgroundColor: "#1a6bb5", opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Creating..." : sendNow ? "Create & Send" : "Create Invoice"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
