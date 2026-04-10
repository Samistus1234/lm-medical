"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/admin/modal";
import { createDeal, updateDealStage } from "./actions";

const STAGES = ["lead", "contacted", "proposal", "negotiation", "won", "lost"];
const stageColors: Record<string, string> = {
  lead: "#94a3b8", contacted: "#2a8fd4", proposal: "#f59e0b", negotiation: "#f59e0b", won: "#15be53", lost: "#ea2261"
};

interface Deal { id: string; title: string; stage: string; value_usd: number | null; value_sdg: number | null; expected_close: string | null; customers: { name: string } | null; }
interface Customer { id: string; name: string; }

export function PipelineBoard({ deals, customers }: { deals: Deal[]; customers: Customer[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  async function handleStageChange(dealId: string, newStage: string) {
    await updateDealStage(dealId, newStage);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 text-sm text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Add Deal</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <div key={stage} className="min-w-[250px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColors[stage] }} />
                <h3 className="text-sm font-normal capitalize" style={{ color: "#273951" }}>{stage}</h3>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#f8fafc", color: "#64748d" }}>{stageDeals.length}</span>
              </div>
              <div className="space-y-2">
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="bg-white rounded-[6px] p-4" style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}>
                    <p className="text-sm font-normal" style={{ color: "#0a1628" }}>{deal.title}</p>
                    <p className="text-xs mt-1" style={{ color: "#64748d" }}>{deal.customers?.name || "—"}</p>
                    {(deal.value_usd || deal.value_sdg) && (
                      <p className="text-xs mt-1" style={{ color: "#1a6bb5" }}>
                        {deal.value_usd ? `$${deal.value_usd.toLocaleString()}` : `${deal.value_sdg?.toLocaleString()} SDG`}
                      </p>
                    )}
                    {deal.expected_close && <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Close: {new Date(deal.expected_close).toLocaleDateString()}</p>}
                    {/* Stage move buttons */}
                    <div className="flex gap-1 mt-3">
                      {STAGES.filter((s) => s !== stage && s !== "lost").map((s) => (
                        <button key={s} onClick={() => handleStageChange(deal.id, s)} className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ color: "#1a6bb5", border: "1px solid #e5edf5" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && <div className="py-8 text-center text-xs rounded-[6px]" style={{ color: "#94a3b8", border: "1px dashed #e5edf5" }}>No deals</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Deal">
        <form action={async (fd) => { await createDeal(fd); setShowAdd(false); router.refresh(); }} className="space-y-4">
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Title *</label><input name="title" required className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Customer *</label>
            <select name="customer_id" required className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
              <option value="">Select...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Stage</label>
            <select name="stage" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Value (USD)</label><input name="value_usd" type="number" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Value (SDG)</label><input name="value_sdg" type="number" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          </div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Probability (%)</label><input name="probability" type="number" min="0" max="100" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Expected Close</label><input name="expected_close" type="date" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Notes</label><textarea name="notes" rows={2} className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          <button type="submit" className="w-full py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Create Deal</button>
        </form>
      </Modal>
    </>
  );
}
