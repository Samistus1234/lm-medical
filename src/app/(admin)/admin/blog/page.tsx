import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function BlogManagerPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Blog Manager</h1>
        <Link href="/admin/blog/new" className="px-4 py-2 text-sm text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>New Post</Link>
      </div>
      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead><tr>
            {["Title", "Status", "Author", "Date"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-normal" style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {posts?.map((p) => (
              <tr key={p.id} className="hover:bg-[#f8fafc]" style={{ borderBottom: "1px solid #e5edf5" }}>
                <td className="px-4 py-3"><Link href={`/admin/blog/${p.id}`} style={{ color: "#1a6bb5" }}>{p.title}</Link></td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3" style={{ color: "#64748d" }}>{p.author || "—"}</td>
                <td className="px-4 py-3" style={{ color: "#94a3b8" }}>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!posts || posts.length === 0) && <tr><td colSpan={4} className="px-4 py-8 text-center" style={{ color: "#64748d" }}>No posts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
