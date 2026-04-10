"use client";

import Link from "next/link";
import { useState } from "react";
import { QuoteCartButton } from "./quote-cart-button";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/quote", label: "Request Quote" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.95)", borderBottom: "1px solid #e5edf5" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.22px" }}>
              L&M Medical
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-normal transition-colors" style={{ color: "#0a1628" }}>
                {link.label}
              </Link>
            ))}
            <QuoteCartButton />
            <Link href="/quote" className="px-4 py-2 text-white text-sm rounded-[4px] transition-colors" style={{ backgroundColor: "#1a6bb5" }}>
              Get a Quote
            </Link>
          </nav>

          <button className="md:hidden p-2" style={{ color: "#0a1628" }} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden py-4 space-y-2" style={{ borderTop: "1px solid #e5edf5" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-2 py-2 text-sm" style={{ color: "#0a1628" }} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
