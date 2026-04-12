"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSupplier(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    name: formData.get("name") as string,
    contact_person: (formData.get("contact_person") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    country: (formData.get("country") as string) || null,
    notes: (formData.get("notes") as string) || null,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/suppliers");
  return { success: true };
}

export async function updateSupplier(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").update({
    name: formData.get("name") as string,
    contact_person: (formData.get("contact_person") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    country: (formData.get("country") as string) || null,
    notes: (formData.get("notes") as string) || null,
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/suppliers");
  return { success: true };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/suppliers");
  return { success: true };
}
