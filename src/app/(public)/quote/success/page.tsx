import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ number?: string }>;
}

export default async function QuoteSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(21,190,83,0.1)" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15be53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-3xl font-light mb-4" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
        Quote Request Submitted!
      </h1>

      {params.number && (
        <p className="text-lg mb-2" style={{ color: "#1a6bb5" }}>
          Reference: {params.number}
        </p>
      )}

      <p className="mb-8" style={{ color: "#64748d" }}>
        Thank you for your interest. Our team will review your request and get back to you with pricing within 24-48 hours.
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link href="/products" className="px-6 py-3 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>
          Continue Browsing
        </Link>
        <Link href="/" className="px-6 py-3 rounded-[4px]" style={{ color: "#1a6bb5", border: "1px solid #1a6bb5" }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
