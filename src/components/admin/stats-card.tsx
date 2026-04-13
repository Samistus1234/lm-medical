interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  accentColor?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ label, value, subtitle, trend, accentColor = "#1a6bb5", icon }: StatsCardProps) {
  return (
    <div
      className="bg-white rounded-[6px] p-6 transition-all duration-200 hover:shadow-md"
      style={{
        border: "1px solid #e5edf5",
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px",
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm" style={{ color: "#64748d" }}>{label}</p>
        {icon && <span style={{ color: accentColor, opacity: 0.7 }}>{icon}</span>}
      </div>
      <p className="text-2xl font-light mt-1" style={{ color: "#0a1628" }}>{value}</p>
      {subtitle && <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{subtitle}</p>}
      {trend && (
        <p className="text-xs mt-2" style={{ color: trend.positive ? "#108c3d" : "#ea2261" }}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </div>
  );
}
