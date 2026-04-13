"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { Modal } from "@/components/admin/modal";
import { createCustomer } from "./actions";

interface Customer {
  id: string;
  name: string;
  type: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
}

export function CustomerList({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = customers.filter((c) => {
    if (typeFilter && c.type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || (c.email?.toLowerCase().includes(s) ?? false);
    }
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-[4px] text-sm w-64 focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
          <option value="">All Types</option>
          <option value="hospital">Hospital</option>
          <option value="clinic">Clinic</option>
          <option value="distributor">Distributor</option>
          <option value="individual">Individual</option>
        </select>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 text-sm text-white rounded-[6px] ml-auto transition-all duration-200 hover:shadow-md" style={{ backgroundColor: "#1a6bb5", boxShadow: "0 1px 3px rgba(26,107,181,0.3)" }}>
          Add Customer
        </button>
      </div>

      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Type", "Contact", "Email", "Phone", "City"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-[#f5f3ff] transition-colors" style={{ borderBottom: "1px solid #e5edf5" }}
                onClick={() => router.push(`/admin/customers/${c.id}`)}>
                <td className="px-4 py-3 font-normal" style={{ color: "#0a1628" }}>{c.name}</td>
                <td className="px-4 py-3"><StatusBadge status={c.type} /></td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{c.contact_person || "—"}</td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{c.email || "—"}</td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{c.phone || "—"}</td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{c.city || "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#64748d" }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>{filtered.length} customers</p>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
        <form action={async (formData) => { await createCustomer(formData); setShowAdd(false); }} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "#273951" }}>Name *</label>
            <input name="name" required className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "#273951" }}>Type *</label>
            <select name="type" required className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="distributor">Distributor</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          {[
            { name: "contact_person", label: "Contact Person" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone" },
            { name: "address", label: "Address" },
            { name: "city", label: "City" },
            { name: "country", label: "Country" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm mb-1" style={{ color: "#273951" }}>{f.label}</label>
              <input name={f.name} type={f.type || "text"} className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
            </div>
          ))}
          <div>
            <label className="block text-sm mb-1" style={{ color: "#273951" }}>Notes</label>
            <textarea name="notes" rows={3} className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]" style={{ borderColor: "#e5edf5", color: "#0a1628" }} />
          </div>
          <button type="submit" className="w-full py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Add Customer</button>
        </form>
      </Modal>
    </>
  );
}
