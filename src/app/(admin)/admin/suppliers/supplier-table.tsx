"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/modal";
import { createSupplier, updateSupplier, deleteSupplier } from "./actions";

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface SupplierTableProps {
  suppliers: Supplier[];
}

export function SupplierTable({ suppliers }: SupplierTableProps) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = suppliers.filter((s) => {
    if (!search) return true;
    return s.name.toLowerCase().includes(search.toLowerCase());
  });

  const formFields = [
    { name: "name", label: "Supplier Name", required: true },
    { name: "contact_person", label: "Contact Person" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "whatsapp", label: "WhatsApp" },
    { name: "address", label: "Address" },
    { name: "city", label: "City" },
    { name: "country", label: "Country" },
    { name: "notes", label: "Notes" },
  ];

  function SupplierForm({ supplier }: { supplier?: Supplier }) {
    return (
      <form
        action={async (formData) => {
          if (supplier) {
            await updateSupplier(supplier.id, formData);
            setEditing(null);
          } else {
            await createSupplier(formData);
            setShowAdd(false);
          }
        }}
        className="space-y-4"
      >
        {formFields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm mb-1" style={{ color: "#273951" }}>
              {f.label}{f.required && " *"}
            </label>
            {f.name === "notes" ? (
              <textarea
                name={f.name}
                defaultValue={supplier ? (supplier[f.name as keyof Supplier] as string) || "" : ""}
                rows={3}
                className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
                style={{ borderColor: "#e5edf5", color: "#0a1628" }}
              />
            ) : (
              <input
                name={f.name}
                type={f.type || "text"}
                required={f.required}
                defaultValue={supplier ? (supplier[f.name as keyof Supplier] as string) || "" : ""}
                className="w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]"
                style={{ borderColor: "#e5edf5", color: "#0a1628" }}
              />
            )}
          </div>
        ))}
        <button type="submit" className="w-full py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>
          {supplier ? "Update Supplier" : "Add Supplier"}
        </button>
      </form>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-[4px] text-sm w-64 focus:outline-none focus:border-[#1a6bb5]"
          style={{ borderColor: "#e5edf5", color: "#0a1628" }}
        />
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm text-white rounded-[6px] ml-auto transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: "#1a6bb5", boxShadow: "0 1px 3px rgba(26,107,181,0.3)" }}
        >
          Add Supplier
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Contact Person", "Email", "Phone", "Country", "Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-3 font-normal whitespace-nowrap" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[#f0fdfa] transition-colors" style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-3 py-2 font-medium" style={{ color: "#0a1628" }}>{s.name}</td>
                <td className="px-3 py-2" style={{ color: "#64748d" }}>{s.contact_person || "—"}</td>
                <td className="px-3 py-2" style={{ color: "#64748d" }}>{s.email || "—"}</td>
                <td className="px-3 py-2" style={{ color: "#64748d" }}>{s.phone || "—"}</td>
                <td className="px-3 py-2" style={{ color: "#64748d" }}>{s.country || "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(s)}
                      className="px-2 py-1 text-xs rounded-[4px] transition-colors hover:bg-[#e8f4fd]"
                      style={{ color: "#1a6bb5" }}
                    >
                      Edit
                    </button>
                    {deleting === s.id ? (
                      <span className="flex gap-1">
                        <button
                          onClick={async () => { await deleteSupplier(s.id); setDeleting(null); }}
                          className="px-2 py-1 text-xs rounded-[4px] text-white"
                          style={{ backgroundColor: "#dc2626" }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleting(null)}
                          className="px-2 py-1 text-xs rounded-[4px]"
                          style={{ color: "#64748d" }}
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleting(s.id)}
                        className="px-2 py-1 text-xs rounded-[4px] transition-colors hover:bg-red-50"
                        style={{ color: "#dc2626" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>{filtered.length} of {suppliers.length} suppliers</p>

      {/* Add Supplier Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Supplier">
        <SupplierForm />
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Supplier">
        {editing && <SupplierForm supplier={editing} />}
      </Modal>
    </>
  );
}
