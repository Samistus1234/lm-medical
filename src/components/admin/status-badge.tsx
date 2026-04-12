const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  // Quote statuses
  pending: { bg: "rgba(245,158,11,0.1)", text: "#9b6829", border: "rgba(245,158,11,0.2)" },
  reviewed: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.2)" },
  quoted: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.2)" },
  accepted: { bg: "rgba(21,190,83,0.1)", text: "#108c3d", border: "rgba(21,190,83,0.2)" },
  rejected: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.2)" },
  expired: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.2)" },
  // Order statuses
  confirmed: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.2)" },
  processing: { bg: "rgba(245,158,11,0.1)", text: "#9b6829", border: "rgba(245,158,11,0.2)" },
  shipped: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.2)" },
  delivered: { bg: "rgba(21,190,83,0.1)", text: "#108c3d", border: "rgba(21,190,83,0.2)" },
  cancelled: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.2)" },
  // Invoice statuses
  draft: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.2)" },
  sent: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.2)" },
  paid: { bg: "rgba(21,190,83,0.1)", text: "#108c3d", border: "rgba(21,190,83,0.2)" },
  overdue: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.2)" },
  // Pipeline
  lead: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.2)" },
  contacted: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.2)" },
  proposal: { bg: "rgba(245,158,11,0.1)", text: "#9b6829", border: "rgba(245,158,11,0.2)" },
  negotiation: { bg: "rgba(245,158,11,0.1)", text: "#9b6829", border: "rgba(245,158,11,0.2)" },
  won: { bg: "rgba(21,190,83,0.1)", text: "#108c3d", border: "rgba(21,190,83,0.2)" },
  lost: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.2)" },
  // Purchase Order statuses
  received: { bg: "rgba(21,190,83,0.1)", text: "#108c3d", border: "rgba(21,190,83,0.2)" },
  // Blog
  published: { bg: "rgba(21,190,83,0.1)", text: "#108c3d", border: "rgba(21,190,83,0.2)" },
  // Team
  admin: { bg: "rgba(234,34,97,0.1)", text: "#ea2261", border: "rgba(234,34,97,0.2)" },
  sales: { bg: "rgba(42,143,212,0.1)", text: "#1a6bb5", border: "rgba(42,143,212,0.2)" },
  inventory: { bg: "rgba(245,158,11,0.1)", text: "#9b6829", border: "rgba(245,158,11,0.2)" },
  viewer: { bg: "rgba(148,163,184,0.1)", text: "#64748d", border: "rgba(148,163,184,0.2)" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = statusColors[status] || statusColors.draft;
  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded-[4px] capitalize ${className || ""}`}
      style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
    >
      {status}
    </span>
  );
}
