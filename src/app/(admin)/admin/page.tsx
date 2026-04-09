export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-light mb-2" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
        Dashboard
      </h1>
      <p style={{ color: "#64748d" }}>Welcome to L&M Medical Solutions CRM.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {["Revenue", "Active Quotes", "Pending Orders", "Low Stock"].map((label) => (
          <div key={label} className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}>
            <p className="text-sm" style={{ color: "#64748d" }}>{label}</p>
            <p className="text-2xl font-light mt-1" style={{ color: "#0a1628" }}>--</p>
          </div>
        ))}
      </div>
    </div>
  );
}
