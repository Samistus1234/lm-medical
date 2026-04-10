import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on orthopedic surgery, implant technology, and surgical best practices from L&M Medical Solutions.",
};

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, content, cover_image, author, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-light mb-2" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
        Blog
      </h1>
      <p className="mb-8" style={{ color: "#64748d" }}>
        News, updates, and insights from L&M Medical Solutions.
      </p>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div className="bg-white rounded-[6px] overflow-hidden transition-shadow hover:shadow-[rgba(50,50,93,0.25)_0px_30px_45px_-30px,rgba(0,0,0,0.1)_0px_18px_36px_-18px]"
                style={{ border: "1px solid #e5edf5", boxShadow: "rgba(23,23,23,0.06) 0px 3px 6px" }}>
                {/* Cover image or placeholder */}
                <div className="aspect-video bg-[#f8fafc] flex items-center justify-center" style={{ borderBottom: "1px solid #e5edf5" }}>
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-base font-normal group-hover:text-[#1a6bb5] transition-colors" style={{ color: "#0a1628" }}>
                    {post.title}
                  </h3>
                  <p className="text-sm mt-2 line-clamp-2" style={{ color: "#64748d" }}>
                    {post.content?.substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {post.author && <span className="text-xs" style={{ color: "#94a3b8" }}>{post.author}</span>}
                    {post.published_at && (
                      <span className="text-xs" style={{ color: "#94a3b8" }}>
                        {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg" style={{ color: "#64748d" }}>No blog posts yet.</p>
          <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>Check back soon for updates.</p>
        </div>
      )}
    </div>
  );
}
