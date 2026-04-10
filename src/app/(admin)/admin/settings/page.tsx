"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const settings = Object.fromEntries(fd.entries());
    localStorage.setItem("lm-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Company Information</h3>
          <div className="space-y-4">
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Company Name</label><input name="company_name" defaultValue="L&M Medical Solutions" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Address</label><input name="address" defaultValue="Khartoum, Sudan" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Phone</label><input name="phone" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>WhatsApp Number</label><input name="whatsapp" placeholder="e.g., 249xxxxxxxxx" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          </div>
        </div>

        <div className="bg-white rounded-[6px] p-6" style={{ border: "1px solid #e5edf5" }}>
          <h3 className="text-sm font-normal mb-4" style={{ color: "#273951" }}>Currency & Thresholds</h3>
          <div className="space-y-4">
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Exchange Rate (1 USD = X SDG)</label><input name="exchange_rate" type="number" step="0.01" defaultValue="600" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Low Stock Threshold</label><input name="low_stock_threshold" type="number" defaultValue="5" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
            <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Quote Expiry (days)</label><input name="quote_expiry_days" type="number" defaultValue="30" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-6 py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Save Settings</button>
          {saved && <span className="text-sm" style={{ color: "#108c3d" }}>Saved!</span>}
        </div>
      </form>
    </div>
  );
}
