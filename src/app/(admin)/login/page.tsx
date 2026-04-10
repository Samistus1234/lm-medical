"use client";

import { useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpeg" alt="L&M Medical Solutions" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-[#64748d] mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-[6px] p-8 border border-[#e5edf5]" style={{boxShadow: "rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px"}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-[#ea2261] rounded-[4px] px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-normal text-[#273951] mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-[#e5edf5] rounded-[4px] text-[#0a1628] focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5] placeholder:text-[#94a3b8]"
                placeholder="you@lmmedicalsolutions.org"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-normal text-[#273951] mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-[#e5edf5] rounded-[4px] text-[#0a1628] focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5] placeholder:text-[#94a3b8]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1a6bb5] text-white rounded-[4px] font-normal hover:bg-[#155a96] focus:outline-none focus:ring-2 focus:ring-[#1a6bb5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
