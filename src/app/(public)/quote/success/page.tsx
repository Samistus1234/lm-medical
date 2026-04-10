import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ number?: string }>;
}

export default async function QuoteSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div>
      {/* ═══ CELEBRATION HERO ═══ */}
      <section
        className="relative overflow-hidden flex items-center justify-center"
        style={{
          background: "linear-gradient(165deg, #0a1628 0%, #0d1b2a 40%, #132940 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Floating particles via CSS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 37 + 13) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                width: `${(i % 4) + 2}px`,
                height: `${(i % 4) + 2}px`,
                backgroundColor: "rgba(42,143,212,0.12)",
                animation: `floatParticle ${15 + (i % 10) * 2}s ease-in-out ${-(i % 15)}s infinite`,
                "--drift": `${((i % 7) - 3) * 10}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Glowing orbs */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "10%",
            right: "-10%",
            background: "radial-gradient(circle, rgba(26,107,181,0.12) 0%, transparent 70%)",
            filter: "blur(100px)",
            animation: "orbFloat 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "400px",
            height: "400px",
            bottom: "10%",
            left: "-5%",
            background: "radial-gradient(circle, rgba(42,143,212,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "orbFloat 10s ease-in-out 2s infinite",
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(42,143,212,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(42,143,212,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
          {/* Animated Checkmark */}
          <div className="flex justify-center mb-10">
            <div
              className="relative"
              style={{ width: "120px", height: "120px" }}
            >
              {/* Circle */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="absolute inset-0"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(21,190,83,0.2)"
                  strokeWidth="2"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#15be53"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="339.292"
                  strokeDashoffset="339.292"
                  style={{
                    animation: "drawCircle 0.8s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards",
                  }}
                />
              </svg>
              {/* Checkmark */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="absolute inset-0"
              >
                <polyline
                  points="40,62 54,76 82,48"
                  fill="none"
                  stroke="#15be53"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="60"
                  strokeDashoffset="60"
                  style={{
                    animation: "drawCheck 0.5s cubic-bezier(0.65, 0, 0.35, 1) 0.9s forwards",
                  }}
                />
              </svg>
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(21,190,83,0.1) 0%, transparent 70%)",
                  animation: "pulseGlow 2s ease-in-out 1.4s infinite",
                }}
              />
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-light mb-4"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              color: "#ffffff",
              letterSpacing: "-0.8px",
              lineHeight: "1.2",
              opacity: 0,
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards",
            }}
          >
            Quote Request Submitted
          </h1>

          <p
            className="text-base mb-8"
            style={{
              color: "rgba(255,255,255,0.45)",
              lineHeight: "1.7",
              opacity: 0,
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.4s forwards",
            }}
          >
            Thank you for your interest. Our specialists will review your requirements and prepare detailed pricing.
          </p>

          {/* Quote number glass card */}
          {params.number && (
            <div
              className="inline-block mb-14"
              style={{
                opacity: 0,
                animation: "fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.6s forwards",
              }}
            >
              <div
                className="px-8 py-5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
              >
                <p
                  className="text-[11px] uppercase mb-2 font-medium"
                  style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "2px" }}
                >
                  Reference Number
                </p>
                <p
                  className="text-2xl font-light"
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                    color: "#2a8fd4",
                    letterSpacing: "2px",
                  }}
                >
                  {params.number}
                </p>
              </div>
            </div>
          )}

          {/* What happens next */}
          <div
            style={{
              opacity: 0,
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.8s forwards",
            }}
          >
            <p
              className="text-xs uppercase font-medium mb-8"
              style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "2.5px" }}
            >
              What happens next
            </p>

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-12 mb-14">
              {[
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  ),
                  title: "Review",
                  desc: "Our team reviews your product selection",
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  ),
                  title: "Pricing",
                  desc: "Competitive quote prepared within 24-48h",
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  ),
                  title: "Delivery",
                  desc: "Coordinated delivery to your facility",
                },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center max-w-[160px]">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: "rgba(42,143,212,0.1)",
                      border: "1px solid rgba(42,143,212,0.15)",
                      color: "#2a8fd4",
                    }}
                  >
                    {step.icon}
                  </div>
                  <h3
                    className="text-sm font-semibold mb-1.5"
                    style={{ color: "#ffffff" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.35)", lineHeight: "1.6" }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{
              opacity: 0,
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 2s forwards",
            }}
          >
            <Link
              href="/products"
              className="success-cta-primary group inline-flex items-center gap-2.5 px-8 py-4 text-white text-sm font-semibold uppercase rounded-xl transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Continue Browsing
            </Link>

            <Link
              href="/"
              className="success-cta-secondary inline-flex items-center gap-2.5 px-8 py-4 text-sm font-semibold uppercase rounded-xl transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .success-cta-primary {
          background: linear-gradient(135deg, #1a6bb5, #2a8fd4);
          box-shadow: 0 4px 20px rgba(26,107,181,0.35);
          letter-spacing: 1px;
        }
        .success-cta-primary:hover {
          box-shadow: 0 8px 32px rgba(26,107,181,0.5);
          transform: translateY(-2px);
        }
        .success-cta-secondary {
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.12);
          letter-spacing: 1px;
          background-color: transparent;
        }
        .success-cta-secondary:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.9);
          background-color: rgba(255,255,255,0.05);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
