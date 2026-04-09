import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 style={{ color: "#0a1628" }} className="font-light" >
          Orthopedic Implants<br />
          <span style={{ color: "#1a6bb5" }}>You Can Trust</span>
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "#64748d" }}>
          Premium screws, plates, fixators, and complete systems for hospitals and surgeons across Sudan and the region.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/products" className="px-6 py-3 text-white rounded-[4px] transition-colors" style={{ backgroundColor: "#1a6bb5" }}>
            Browse Catalog
          </Link>
          <Link href="/quote" className="px-6 py-3 rounded-[4px] transition-colors" style={{ color: "#1a6bb5", border: "1px solid #1a6bb5" }}>
            Request Quote
          </Link>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: "#0a1628" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { value: "123+", label: "Products" },
            { value: "12", label: "Categories" },
            { value: "3,500+", label: "Units in Stock" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-light text-white">{stat.value}</p>
              <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
