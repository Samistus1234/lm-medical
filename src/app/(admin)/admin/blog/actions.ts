"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const status = formData.get("status") as string || "draft";
  const { error } = await supabase.from("blog_posts").insert({
    title, slug,
    content: (formData.get("content") as string) || "",
    cover_image: (formData.get("cover_image") as string) || null,
    author: (formData.get("author") as string) || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  return { success: true };
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient();
  const status = formData.get("status") as string;
  const { error } = await supabase.from("blog_posts").update({
    title: formData.get("title") as string,
    content: (formData.get("content") as string) || "",
    cover_image: (formData.get("cover_image") as string) || null,
    author: (formData.get("author") as string) || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  return { success: true };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blog");
  return { success: true };
}
