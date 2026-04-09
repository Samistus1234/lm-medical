import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0d1b2a" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-light text-lg mb-4" style={{ letterSpacing: "-0.22px" }}>
              L&M Medical Solutions
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Premium orthopedic implants and surgical supplies for hospitals and surgeons across Sudan and the region.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-normal mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[{ href: "/products", label: "Products" }, { href: "/quote", label: "Request Quote" }, { href: "/blog", label: "Blog" }].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-normal mb-4">Contact</h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <li>Khartoum, Sudan</li>
              <li>info@lmmedical.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
          &copy; {new Date().getFullYear()} L&M Medical Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
