const statusColors: Record<string, { bg: string; text: string; border: string; dot?: string }> = {
  // Quote statuses
  pending: { bg: "rgba(245,158,11,0.1)", text: "#b45309", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
  reviewed: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.3)", dot: "#2a8fd4" },
  quoted: { bg: "rgba(249,115,22,0.1)", text: "#c2410c", border: "rgba(249,115,22,0.3)", dot: "#f97316" },
  accepted: { bg: "rgba(16,185,129,0.1)", text: "#059669", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
  rejected: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.3)", dot: "#ea2261" },
  expired: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.3)", dot: "#94a3b8" },
  // Order statuses
  confirmed: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.3)", dot: "#2a8fd4" },
  processing: { bg: "rgba(99,102,241,0.1)", text: "#4f46e5", border: "rgba(99,102,241,0.3)", dot: "#6366f1" },
  shipped: { bg: "rgba(20,184,166,0.1)", text: "#0d9488", border: "rgba(20,184,166,0.3)", dot: "#14b8a6" },
  delivered: { bg: "rgba(16,185,129,0.1)", text: "#059669", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
  cancelled: { bg: "rgba(239,68,68,0.1)", text: "#dc2626", border: "rgba(239,68,68,0.3)", dot: "#ef4444" },
  // Invoice statuses
  draft: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.3)", dot: "#94a3b8" },
  sent: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.3)", dot: "#2a8fd4" },
  paid: { bg: "rgba(16,185,129,0.1)", text: "#059669", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
  overdue: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.3)", dot: "#ea2261" },
  // Pipeline
  lead: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.3)", dot: "#94a3b8" },
  contacted: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.3)", dot: "#2a8fd4" },
  proposal: { bg: "rgba(249,115,22,0.1)", text: "#c2410c", border: "rgba(249,115,22,0.3)", dot: "#f97316" },
  negotiation: { bg: "rgba(245,158,11,0.1)", text: "#b45309", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
  won: { bg: "rgba(139,92,246,0.1)", text: "#7c3aed", border: "rgba(139,92,246,0.3)", dot: "#8b5cf6" },
  lost: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.3)", dot: "#ea2261" },
  // Purchase Order statuses
  received: { bg: "rgba(16,185,129,0.1)", text: "#059669", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
  // Blog
  published: { bg: "rgba(16,185,129,0.1)", text: "#059669", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
  // Team
  admin: { bg: "rgba(139,92,246,0.1)", text: "#7c3aed", border: "rgba(139,92,246,0.3)", dot: "#8b5cf6" },
  sales: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.3)", dot: "#2a8fd4" },
  inventory: { bg: "rgba(245,158,11,0.1)", text: "#b45309", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
  viewer: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.3)", dot: "#94a3b8" },
  // Customer types
  hospital: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.3)", dot: "#2a8fd4" },
  clinic: { bg: "rgba(20,184,166,0.1)", text: "#0d9488", border: "rgba(20,184,166,0.3)", dot: "#14b8a6" },
  distributor: { bg: "rgba(139,92,246,0.1)", text: "#7c3aed", border: "rgba(139,92,246,0.3)", dot: "#8b5cf6" },
  individual: { bg: "rgba(249,115,22,0.1)", text: "#c2410c", border: "rgba(249,115,22,0.3)", dot: "#f97316" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = statusColors[status] || statusColors.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${className || ""}`}
      style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {colors.dot && (
        <span
          className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
          style={{ backgroundColor: colors.dot }}
        />
      )}
      {status}
    </span>
  );
}
