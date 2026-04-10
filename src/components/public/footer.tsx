import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative" style={{ backgroundColor: "#0a1628" }}>
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent 0%, #1a6bb5 30%, #2a8fd4 50%, #1a6bb5 70%, transparent 100%)" }} />

      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Image
              src="/logo.jpeg"
              alt="L&M Medical Solutions"
              width={200}
              height={62}
              className="h-14 w-auto mb-4"
            />
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Premium orthopedic implants and surgical supplies for hospitals and surgeons across Sudan and the region. Engineered for precision. Built for trust.
            </p>
            <div className="mt-6 flex items-center gap-1">
              <div className="w-8 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, #1a6bb5, #2a8fd4)" }} />
              <div className="w-2 h-[2px] rounded-full" style={{ backgroundColor: "#2a8fd4", opacity: 0.5 }} />
              <div className="w-1 h-[2px] rounded-full" style={{ backgroundColor: "#2a8fd4", opacity: 0.3 }} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[2px] uppercase mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>Navigate</h4>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "Products" },
                { href: "/quote", label: "Request Quote" },
                { href: "/blog", label: "Blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all duration-300 hover:text-white hover:pl-1"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[2px] uppercase mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>Contact</h4>
            <ul className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              <li className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,143,212,0.6)" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Khartoum, Sudan
              </li>
              <li className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,143,212,0.6)" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
                info@lmmedicalsolutions.org
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            &copy; {new Date().getFullYear()} L&M Medical Solutions. All rights reserved.
            <span className="mx-1">|</span>
            Built by{" "}
            <a href="https://www.elabifytechnologies.com/" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.4)" }}>
              Elabify Technologies
            </a>
          </p>

          {/* Back to top */}
          <a
            href="#"
            onClick={undefined}
            className="group inline-flex items-center gap-2 text-xs transition-all duration-300 hover:text-white"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Back to top
            <svg className="w-3.5 h-3.5 transform group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M5 15l7-7 7 7" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
