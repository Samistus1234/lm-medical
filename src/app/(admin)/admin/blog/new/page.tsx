"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPost } from "../actions";

export default function NewPostPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await createPost(formData);
    if (result.error) { setError(result.error); return; }
    router.push("/admin/blog");
  }

  return (
    <div className="max-w-3xl">
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#64748d" }}>
        <Link href="/admin/blog" className="hover:text-[#1a6bb5]">Blog</Link><span>/</span><span style={{ color: "#0a1628" }}>New Post</span>
      </nav>
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>New Blog Post</h1>
      {error && <div className="bg-red-50 border border-red-200 text-[#ea2261] rounded-[4px] px-4 py-3 text-sm mb-4">{error}</div>}
      <form action={handleSubmit} className="space-y-4">
        <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Title *</label><input name="title" required className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
        <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Content</label><textarea name="content" rows={12} className="w-full px-3 py-2 border rounded-[4px] text-sm font-mono" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
        <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Cover Image URL</label><input name="cover_image" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
        <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Author</label><input name="author" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }} /></div>
        <div><label className="block text-sm mb-1" style={{ color: "#273951" }}>Status</label>
          <select name="status" className="w-full px-3 py-2 border rounded-[4px] text-sm" style={{ borderColor: "#e5edf5", color: "#0a1628" }}>
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 text-white rounded-[4px]" style={{ backgroundColor: "#1a6bb5" }}>Create Post</button>
          <Link href="/admin/blog" className="px-6 py-2 rounded-[4px]" style={{ color: "#64748d", border: "1px solid #e5edf5" }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
