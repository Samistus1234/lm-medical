"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/admin/modal";
import { inviteMember, updateMemberRole, toggleMemberActive } from "./actions";

interface Member { id: string; name: string; email: string; role: string; is_active: boolean; }

export function TeamList({ members }: { members: Member[] }) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowInvite(true)} className="px-4 py-2 text-sm text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Invite Member</button>
      </div>
      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead><tr>
            {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-3" style={{ color: "#0a1628" }}>{m.name}</td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{m.email}</td>
                <td className="px-4 py-3">
                  <select value={m.role} onChange={async (e) => { await updateMemberRole(m.id, e.target.value); router.refresh(); }}
                    className="text-xs px-2 py-1 border rounded-[4px]" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
                    <option value="admin">Admin</option><option value="sales">Sales</option>
                    <option value="inventory">Inventory</option><option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: m.is_active ? "#108c3d" : "#ea2261" }}>{m.is_active ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={async () => { await toggleMemberActive(m.id, !m.is_active); router.refresh(); }}
                    className="text-xs" style={{ color: m.is_active ? "#ea2261" : "#15be53" }}>
                    {m.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <form action={async (fd) => { await inviteMember(fd); setShowInvite(false); router.refresh(); }} className="space-y-4">
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Name *</label><input name="name" required className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Email *</label><input name="email" type="email" required className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Password *</label><input name="password" type="password" required minLength={6} className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Role</label>
            <select name="role" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
              <option value="sales">Sales</option><option value="inventory">Inventory</option>
              <option value="viewer">Viewer</option><option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Invite</button>
        </form>
      </Modal>
    </>
  );
}
