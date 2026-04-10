"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { QuoteCartButton } from "./quote-cart-button";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Insights" },
  { href: "/quote", label: "Request Quote" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        mounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      style={{
        backgroundColor: scrolled ? "rgba(10, 22, 40, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #1a6bb5, #2a8fd4)" }}
            >
              <span className="text-white font-bold text-sm">L&M</span>
            </div>
            <div>
              <span
                className="text-lg text-white tracking-wide"
                style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
              >
                L&M Medical
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[3px] text-white/40">
                Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-5 py-2 text-sm text-white/70 hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-[#2a8fd4] to-transparent group-hover:w-3/4 transition-all duration-300" />
              </Link>
            ))}

            <div className="ml-4 flex items-center gap-3">
              <QuoteCartButton />
              <Link
                href="/quote"
                className="relative px-6 py-2.5 text-sm text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(26,107,181,0.4)]"
                style={{ background: "linear-gradient(135deg, #1a6bb5, #155a96)" }}
              >
                <span className="relative z-10">Get a Quote</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2a8fd4] to-[#1a6bb5] opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`w-full h-[1.5px] bg-current transform transition-all duration-300 ${
                  mobileOpen ? "rotate-45 translate-y-[9px]" : ""
                }`}
              />
              <span
                className={`w-full h-[1.5px] bg-current transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`w-full h-[1.5px] bg-current transform transition-all duration-300 ${
                  mobileOpen ? "-rotate-45 -translate-y-[9px]" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav
            className="py-4 space-y-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                style={{ transitionDelay: `${i * 50}ms` }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
