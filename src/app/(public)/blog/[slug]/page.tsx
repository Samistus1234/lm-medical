import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt || `${post.title} — L&M Medical Solutions blog.`,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "#64748d" }}>
        <Link href="/blog" className="hover:text-[#1a6bb5]">Blog</Link>
        <span>/</span>
        <span style={{ color: "#0a1628" }}>{post.title}</span>
      </nav>

      {/* Cover image */}
      {post.cover_image && (
        <div className="aspect-video rounded-[8px] overflow-hidden mb-8">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title & meta */}
      <h1 className="text-3xl font-light mb-4" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>
        {post.title}
      </h1>

      <div className="flex items-center gap-4 mb-8 text-sm" style={{ color: "#94a3b8" }}>
        {post.author && <span>{post.author}</span>}
        {post.published_at && (
          <span>{new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none" style={{ color: "#0a1628" }}>
        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }} />
      </div>

      {/* Back link */}
      <div className="mt-12 pt-8" style={{ borderTop: "1px solid #e5edf5" }}>
        <Link href="/blog" className="text-sm" style={{ color: "#1a6bb5" }}>
          &larr; Back to Blog
        </Link>
      </div>
    </div>
  );
}
